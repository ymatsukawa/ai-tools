package engine

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
	"sync/atomic"

	_ "golang.org/x/image/bmp"
	_ "golang.org/x/image/tiff"
	_ "golang.org/x/image/webp"
)

// ImageLoader handles concurrent loading of images with memory management.
// Fields are ordered by decreasing size to minimize struct padding.
type ImageLoader struct {
	maxMemory     uint64          // Maximum memory allowed for loaded images
	currentMemory *uint64         // Atomic counter for current memory usage
	loadQueue     chan *ImageData // Channel for images to be loaded
	resultQueue   chan *ImageData // Channel for loaded image results
	wg            sync.WaitGroup  // WaitGroup for worker synchronization
	numWorkers    int             // Number of worker goroutines
}

// NewImageLoader creates a new image loader with the specified memory limit.
// It initializes worker channels and sets up concurrent loading infrastructure.
// Worker count is dynamically set based on CPU count for optimal performance.
func NewImageLoader(maxMemory uint64) *ImageLoader {
	currentMemory := uint64(0)
	// Use runtime.NumCPU() for optimal worker count, min 2, max 16
	numWorkers := runtime.NumCPU()
	if numWorkers < 2 {
		numWorkers = 2
	}
	if numWorkers > 16 {
		numWorkers = 16
	}
	
	return &ImageLoader{
		maxMemory:     maxMemory,
		currentMemory: &currentMemory,
		loadQueue:     make(chan *ImageData, 100),
		resultQueue:   make(chan *ImageData, 100),
		numWorkers:    numWorkers,
	}
}

// SupportedImageExtensions returns a list of file extensions for supported image formats.
func SupportedImageExtensions() []string {
	return []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".webp"}
}

// IsImageFile checks if a file has a supported image extension.
// The comparison is case-insensitive.
func IsImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	for _, supportedExt := range SupportedImageExtensions() {
		if ext == supportedExt {
			return true
		}
	}
	return false
}

// GetImageFiles scans the specified directory and returns a sorted list of image files.
// It skips subdirectories and only includes files with supported image extensions.
func GetImageFiles(dirPath string) ([]string, error) {
	files, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory %s: %w", dirPath, err)
	}

	var imageFiles []string
	for _, file := range files {
		if file.IsDir() {
			continue // Skip subdirectories as per spec
		}

		filename := file.Name()
		if IsImageFile(filename) {
			fullPath := filepath.Join(dirPath, filename)
			imageFiles = append(imageFiles, fullPath)
		}
	}

	// Sort files alphabetically for consistent ordering
	sort.Strings(imageFiles)
	return imageFiles, nil
}

// GetFileSize returns the size of the specified file in bytes.
func GetFileSize(filePath string) (uint64, error) {
	info, err := os.Stat(filePath)
	if err != nil {
		return 0, fmt.Errorf("failed to get file info for %s: %w", filePath, err)
	}
	return uint64(info.Size()), nil
}

// LoadImageData loads image data from the specified file into memory.
// It validates that the file contains a valid image format before returning the data.
func LoadImageData(filePath string) ([]byte, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read image file %s: %w", filePath, err)
	}

	// Validate it's actually an image by trying to decode it
	_, _, err = image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("invalid image format in %s: %w", filePath, err)
	}

	return data, nil
}

// worker processes images from the load queue
func (il *ImageLoader) worker() {
	defer il.wg.Done()

	for imageData := range il.loadQueue {
		// Check if we have memory available
		currentMem := atomic.LoadUint64(il.currentMemory)
		if currentMem+imageData.FileSize > il.maxMemory {
			// Memory limit would be exceeded, mark as not loaded
			imageData.IsLoaded = false
			imageData.Data = nil
		} else {
			// Load the image data
			data, err := LoadImageData(imageData.Path)
			if err != nil {
				fmt.Printf("Error loading image %s: %v\n", imageData.Path, err)
				imageData.IsLoaded = false
				imageData.Data = nil
			} else {
				imageData.Data = data
				imageData.IsLoaded = true
				// Update memory usage atomically
				atomic.AddUint64(il.currentMemory, imageData.FileSize)
			}
		}

		// Send result back
		il.resultQueue <- imageData
	}
}

// LoadImages loads all images from the directory concurrently with memory management.
// It starts worker goroutines to load images in parallel while respecting memory limits.
func (il *ImageLoader) LoadImages(dirPath string, images []ImageData) error {
	// Start worker goroutines
	for i := 0; i < il.numWorkers; i++ {
		il.wg.Add(1)
		go il.worker()
	}

	// Send all images to load queue
	go func() {
		for i := range images {
			il.loadQueue <- &images[i]
		}
		close(il.loadQueue)
	}()

	// Collect results
	loadedCount := 0
	totalImages := len(images)

	for loadedCount < totalImages {
		imageData := <-il.resultQueue
		loadedCount++

		if imageData.IsLoaded {
			fmt.Printf("Loaded image %s (%d bytes) - Total memory: %d bytes\n",
				filepath.Base(imageData.Path),
				imageData.FileSize,
				atomic.LoadUint64(il.currentMemory))
		} else {
			fmt.Printf("Skipped image %s (memory limit or error)\n",
				filepath.Base(imageData.Path))
		}
	}

	// Wait for all workers to finish
	il.wg.Wait()
	close(il.resultQueue)

	fmt.Printf("Loading complete. Total memory used: %d bytes (%.2f MB)\n",
		atomic.LoadUint64(il.currentMemory),
		float64(atomic.LoadUint64(il.currentMemory))/1024/1024)

	return nil
}

// GetCurrentMemoryUsage returns the current memory usage in bytes.
func (il *ImageLoader) GetCurrentMemoryUsage() uint64 {
	return atomic.LoadUint64(il.currentMemory)
}

// FreeImageMemory frees the memory used by an image and updates the memory counter.
func (il *ImageLoader) FreeImageMemory(imageData *ImageData) {
	if imageData.IsLoaded && imageData.Data != nil {
		// Subtract the file size from current memory usage using compare-and-swap
		for {
			current := atomic.LoadUint64(il.currentMemory)
			if current < imageData.FileSize {
				// Prevent underflow - set to 0
				if atomic.CompareAndSwapUint64(il.currentMemory, current, 0) {
					break
				}
			} else {
				newValue := current - imageData.FileSize
				if atomic.CompareAndSwapUint64(il.currentMemory, current, newValue) {
					break
				}
			}
		}
		imageData.Data = nil
		imageData.IsLoaded = false
	}
}

// LoadImageOnDemand loads a single image if it's not already loaded.
// It checks memory limits before loading and returns an error if the limit would be exceeded.
func (il *ImageLoader) LoadImageOnDemand(imageData *ImageData) error {
	if imageData.IsLoaded {
		return nil // Already loaded
	}

	// Check memory limit
	currentMem := atomic.LoadUint64(il.currentMemory)
	if currentMem+imageData.FileSize > il.maxMemory {
		return fmt.Errorf("memory limit exceeded: current %d + image %d > limit %d",
			currentMem, imageData.FileSize, il.maxMemory)
	}

	// Load the image
	data, err := LoadImageData(imageData.Path)
	if err != nil {
		return fmt.Errorf("failed to load image %s: %w", imageData.Path, err)
	}

	imageData.Data = data
	imageData.IsLoaded = true
	atomic.AddUint64(il.currentMemory, imageData.FileSize)

	return nil
}
