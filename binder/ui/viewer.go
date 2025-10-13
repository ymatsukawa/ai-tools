package ui

import (
	"bytes"
	"fmt"
	"image"
	"path/filepath"
	"strings"
	"sync"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"github.com/ymatsukawa/binder/engine"
)

// UIImageViewer defines the interface for image viewing operations.
// It provides methods for loading images from a directory and navigating through them.
type UIImageViewer interface {
	LoadImages(dirPath string) error             // Load images from the specified directory
	NextImage() error                            // Navigate to the next image
	PreviousImage() error                        // Navigate to the previous image
	GetCurrentImage() (*engine.ImageData, error) // Get the currently selected image
	HasImages() bool                             // Check if any images are loaded
	GetImageCount() int                          // Get the total number of loaded images
	GetCurrentIndex() int                        // Get the index of the current image
}

// ImageViewer implements the UIImageViewer interface and manages image loading and display.
// It handles both concurrent and sequential loading strategies based on memory constraints.
// Fields are ordered by decreasing size to minimize struct padding.
type ImageViewer struct {
	Images       []engine.ImageData  // List of images in the current directory
	loader       *engine.ImageLoader // Image loader with memory management
	MaxMemory    uint64              // Maximum memory allowed for loaded images
	CurrentIndex int                 // Index of the currently selected image
	IsSequential bool                // True when memory limit forces sequential loading
	mu           sync.RWMutex        // Protects concurrent access to images

	// GUI components
	imageWidget *widget.Card        // Widget for displaying the current image
	statusLabel *widget.Label       // Label for status information
	progressBar *widget.ProgressBar // Progress bar for loading operations

	// Caching and prefetching
	decodedCache map[int]image.Image // Cache of decoded images to avoid re-decoding
	cacheMu      sync.RWMutex        // Protects decoded cache access
	prefetchWin  int                 // Prefetch window size (images to preload ahead/behind)
	stopPrefetch chan struct{}       // Channel to signal prefetch goroutine to stop
}

// NewImageViewer creates a new ImageViewer with the specified memory limit.
// It initializes all necessary components for image loading and display.
func NewImageViewer(maxMemory uint64) *ImageViewer {
	return &ImageViewer{
		Images:       []engine.ImageData{},
		CurrentIndex: -1,
		MaxMemory:    maxMemory,
		IsSequential: false,
		loader:       engine.NewImageLoader(maxMemory),
		imageWidget:  widget.NewCard("", "", widget.NewLabel("No image selected")),
		statusLabel:  widget.NewLabel("Ready"),
		progressBar:  widget.NewProgressBar(),
		decodedCache: make(map[int]image.Image),
		prefetchWin:  2, // Prefetch 2 images ahead and behind
		stopPrefetch: make(chan struct{}),
	}
}

// LoadImages scans the specified directory and loads images with memory management.
// It determines whether to use concurrent or sequential loading based on total image size.
func (iv *ImageViewer) LoadImages(dirPath string) error {
	iv.mu.Lock()
	defer iv.mu.Unlock()

	// Stop any existing prefetch operations
	select {
	case iv.stopPrefetch <- struct{}{}:
	default:
	}
	
	// Clear decoded cache for new directory
	iv.clearDecodedCache()

	// Update status
	fyne.Do(func() {
		iv.statusLabel.SetText("Scanning directory...")
	})

	// Get all image files from directory
	imageFiles, err := engine.GetImageFiles(dirPath)
	if err != nil {
		return fmt.Errorf("failed to scan directory: %w", err)
	}

	if len(imageFiles) == 0 {
		return fmt.Errorf("no image files found in directory: %s", dirPath)
	}

	// Create ImageData entries with file sizes
	iv.Images = make([]engine.ImageData, 0, len(imageFiles))
	var totalSize uint64

	fyne.Do(func() {
		iv.statusLabel.SetText("Calculating file sizes...")
	})
	for i, filePath := range imageFiles {
		fileSize, err := engine.GetFileSize(filePath)
		if err != nil {
			fmt.Printf("Warning: Could not get size for %s: %v\n", filePath, err)
			continue
		}

		iv.Images = append(iv.Images, engine.ImageData{
			Path:     filePath,
			Data:     nil,
			IsLoaded: false,
			FileSize: fileSize,
		})

		totalSize += fileSize

		// Update progress
		progress := float64(i+1) / float64(len(imageFiles))
		fyne.Do(func() {
			iv.progressBar.SetValue(progress)
		})
	}

	fmt.Printf("Found %d images, total size: %d bytes (%.2f MB)\n",
		len(iv.Images), totalSize, float64(totalSize)/1024/1024)

	// Decide loading strategy
	if totalSize > iv.MaxMemory {
		iv.IsSequential = true
		fyne.Do(func() {
			iv.statusLabel.SetText(fmt.Sprintf("Sequential mode: %d images, %.2f MB total",
				len(iv.Images), float64(totalSize)/1024/1024))
		})
		fmt.Printf("Total size (%.2f MB) exceeds memory limit (%.2f MB), using sequential loading\n",
			float64(totalSize)/1024/1024, float64(iv.MaxMemory)/1024/1024)
	} else {
		iv.IsSequential = false
		fyne.Do(func() {
			iv.statusLabel.SetText("Loading images concurrently...")
		})

		// Load all images concurrently
		err = iv.loader.LoadImages(dirPath, iv.Images)
		if err != nil {
			return fmt.Errorf("failed to load images: %w", err)
		}
	}

	// Set initial image
	if len(iv.Images) > 0 {
		iv.CurrentIndex = 0
		if iv.IsSequential {
			// Load first image on demand
			err = iv.loadCurrentImageIfNeeded()
			if err != nil {
				fmt.Printf("Warning: Failed to load first image: %v\n", err)
			}
		}
		iv.updateStatus()
		
		// Start prefetching for initial images
		iv.mu.Unlock()
		iv.prefetchImages()
		iv.mu.Lock()
	}

	fyne.Do(func() {
		iv.progressBar.SetValue(1.0)
	})
	return nil
}

// loadCurrentImageIfNeeded loads the current image if not already loaded (for sequential mode).
// In sequential mode, it frees other images first to make room in memory.
func (iv *ImageViewer) loadCurrentImageIfNeeded() error {
	if iv.CurrentIndex < 0 || iv.CurrentIndex >= len(iv.Images) {
		return fmt.Errorf("invalid current index: %d", iv.CurrentIndex)
	}

	currentImage := &iv.Images[iv.CurrentIndex]
	if !currentImage.IsLoaded {
		if iv.IsSequential {
			// In sequential mode, free other images first to make room
			iv.freeOtherImages(iv.CurrentIndex)
		}

		err := iv.loader.LoadImageOnDemand(currentImage)
		if err != nil {
			return fmt.Errorf("failed to load image on demand: %w", err)
		}
	}

	return nil
}

// freeOtherImages frees memory of all images except the one at keepIndex.
// This is used in sequential mode to manage memory usage.
func (iv *ImageViewer) freeOtherImages(keepIndex int) {
	for i := range iv.Images {
		if i != keepIndex {
			iv.loader.FreeImageMemory(&iv.Images[i])
		}
	}
}

// prefetchImages prefetches images around the current index in a background goroutine.
// It loads and decodes images within the prefetch window to improve navigation speed.
func (iv *ImageViewer) prefetchImages() {
	go func() {
		iv.mu.RLock()
		currentIdx := iv.CurrentIndex
		imageCount := len(iv.Images)
		prefetchWin := iv.prefetchWin
		isSequential := iv.IsSequential
		iv.mu.RUnlock()

		if imageCount == 0 {
			return
		}

		// Calculate prefetch range
		startIdx := currentIdx - prefetchWin
		if startIdx < 0 {
			startIdx = 0
		}
		endIdx := currentIdx + prefetchWin
		if endIdx >= imageCount {
			endIdx = imageCount - 1
		}

		// Prefetch images in the window
		for i := startIdx; i <= endIdx; i++ {
			select {
			case <-iv.stopPrefetch:
				return
			default:
				// Check if already cached
				iv.cacheMu.RLock()
				_, cached := iv.decodedCache[i]
				iv.cacheMu.RUnlock()

				if cached {
					continue
				}

				iv.mu.RLock()
				if i >= len(iv.Images) {
					iv.mu.RUnlock()
					continue
				}
				imageData := &iv.Images[i]
				iv.mu.RUnlock()

				// In sequential mode, only prefetch the current image
				if isSequential && i != currentIdx {
					continue
				}

				// Load image data if needed
				if !imageData.IsLoaded {
					if !isSequential {
						// Skip if we can't load more
						continue
					}
					// In sequential mode, load on demand
					if i == currentIdx {
						err := iv.loader.LoadImageOnDemand(imageData)
						if err != nil {
							continue
						}
					}
				}

				// Decode and cache the image
				if imageData.IsLoaded && imageData.Data != nil {
					img, _, err := image.Decode(bytes.NewReader(imageData.Data))
					if err == nil {
						iv.cacheMu.Lock()
						iv.decodedCache[i] = img
						iv.cacheMu.Unlock()
					}
				}
			}
		}

		// Clean up old cached images outside the window
		iv.cacheMu.Lock()
		for idx := range iv.decodedCache {
			if idx < startIdx || idx > endIdx {
				delete(iv.decodedCache, idx)
			}
		}
		iv.cacheMu.Unlock()
	}()
}

// clearDecodedCache clears all decoded image cache entries.
func (iv *ImageViewer) clearDecodedCache() {
	iv.cacheMu.Lock()
	defer iv.cacheMu.Unlock()
	iv.decodedCache = make(map[int]image.Image)
}

// NextImage navigates to the next image in the sequence.
// It loads the image on demand if using sequential mode.
func (iv *ImageViewer) NextImage() error {
	iv.mu.Lock()
	defer iv.mu.Unlock()

	if len(iv.Images) == 0 {
		return fmt.Errorf("no images loaded")
	}

	if iv.CurrentIndex < len(iv.Images)-1 {
		iv.CurrentIndex++
		err := iv.loadCurrentImageIfNeeded()
		if err != nil {
			return err
		}
		iv.updateStatus()
		
		// Trigger prefetching for surrounding images
		iv.mu.Unlock()
		iv.prefetchImages()
		iv.mu.Lock()
	}

	return nil
}

// PreviousImage navigates to the previous image in the sequence.
// It loads the image on demand if using sequential mode.
func (iv *ImageViewer) PreviousImage() error {
	iv.mu.Lock()
	defer iv.mu.Unlock()

	if len(iv.Images) == 0 {
		return fmt.Errorf("no images loaded")
	}

	if iv.CurrentIndex > 0 {
		iv.CurrentIndex--
		err := iv.loadCurrentImageIfNeeded()
		if err != nil {
			return err
		}
		iv.updateStatus()
		
		// Trigger prefetching for surrounding images
		iv.mu.Unlock()
		iv.prefetchImages()
		iv.mu.Lock()
	}

	return nil
}

// GetCurrentImage returns the currently selected image.
func (iv *ImageViewer) GetCurrentImage() (*engine.ImageData, error) {
	iv.mu.RLock()
	defer iv.mu.RUnlock()

	if iv.CurrentIndex < 0 || iv.CurrentIndex >= len(iv.Images) {
		return nil, fmt.Errorf("no current image")
	}

	return &iv.Images[iv.CurrentIndex], nil
}

// HasImages returns true if any images are loaded.
func (iv *ImageViewer) HasImages() bool {
	iv.mu.RLock()
	defer iv.mu.RUnlock()
	return len(iv.Images) > 0
}

// GetImageCount returns the total number of loaded images.
func (iv *ImageViewer) GetImageCount() int {
	iv.mu.RLock()
	defer iv.mu.RUnlock()
	return len(iv.Images)
}

// GetCurrentIndex returns the index of the currently selected image.
func (iv *ImageViewer) GetCurrentIndex() int {
	iv.mu.RLock()
	defer iv.mu.RUnlock()
	return iv.CurrentIndex
}

// updateStatus updates the status label with current image and memory information.
func (iv *ImageViewer) updateStatus() {
	if len(iv.Images) == 0 {
		fyne.Do(func() {
			iv.statusLabel.SetText("No images loaded")
		})
		return
	}

	currentImage := &iv.Images[iv.CurrentIndex]
	filename := filepath.Base(currentImage.Path)
	loadStatus := "not loaded"
	if currentImage.IsLoaded {
		loadStatus = "loaded"
	}

	memUsage := iv.loader.GetCurrentMemoryUsage()

	var statusBuilder strings.Builder
	statusBuilder.WriteString(fmt.Sprintf("%s (%s) - Image %d/%d - Memory: %.2f MB/%.2f MB",
		filename, loadStatus,
		iv.CurrentIndex+1, len(iv.Images),
		float64(memUsage)/1024/1024, float64(iv.MaxMemory)/1024/1024))

	if iv.IsSequential {
		statusBuilder.WriteString(" [Sequential Mode]")
	}

	statusText := statusBuilder.String()
	fyne.Do(func() {
		iv.statusLabel.SetText(statusText)
	})
}

// UpdateImageDisplay updates the image widget with the current image.
// It decodes the image data and displays it in the UI, using cache when available.
func (iv *ImageViewer) UpdateImageDisplay() error {
	currentImage, err := iv.GetCurrentImage()
	if err != nil {
		return err
	}

	if !currentImage.IsLoaded || currentImage.Data == nil {
		fyne.Do(func() {
			notLoadedLabel := widget.NewLabel("Image not loaded")
			iv.imageWidget.SetContent(notLoadedLabel)
		})
		return nil
	}

	var img image.Image
	
	// Check if image is already decoded in cache
	iv.cacheMu.RLock()
	cachedImg, cached := iv.decodedCache[iv.CurrentIndex]
	iv.cacheMu.RUnlock()
	
	if cached {
		img = cachedImg
	} else {
		// Decode image from data
		var decodeErr error
		img, _, decodeErr = image.Decode(bytes.NewReader(currentImage.Data))
		if decodeErr != nil {
			return fmt.Errorf("failed to decode image: %w", decodeErr)
		}
		
		// Cache the decoded image
		iv.cacheMu.Lock()
		iv.decodedCache[iv.CurrentIndex] = img
		iv.cacheMu.Unlock()
	}

	// Create canvas image with optimized scaling
	canvasImg := canvas.NewImageFromImage(img)
	canvasImg.FillMode = canvas.ImageFillContain

	// Use smooth scaling for better quality (traded for slight performance)
	canvasImg.ScaleMode = canvas.ImageScaleSmooth

	// Update card content - remove title text
	fyne.Do(func() {
		iv.imageWidget.SetTitle("")
		iv.imageWidget.SetContent(canvasImg)
	})

	return nil
}

// GetStatusContainer returns a container with status information and progress bar.
func (iv *ImageViewer) GetStatusContainer() *fyne.Container {
	return container.NewVBox(
		iv.statusLabel,
		iv.progressBar,
	)
}

// GetImageContainer returns the main image display container.
func (iv *ImageViewer) GetImageContainer() *widget.Card {
	return iv.imageWidget
}
