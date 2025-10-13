package main

import (
	"fmt"
	"path/filepath"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
	"github.com/ymatsukawa/binder/ui"
)

const (
	MaxMemoryBytes = 3 * 1024 * 1024 * 1024 // 3GB memory limit
	AppTitle       = "High-Speed Image Viewer"
)

// ImageViewerApp represents the main application structure for the high-speed image viewer.
// It manages the Fyne GUI components and coordinates between the UI and image loading engine.
// Fields are ordered by decreasing size to minimize struct padding.
type ImageViewerApp struct {
	app             fyne.App         // Main Fyne application instance
	window          fyne.Window      // Main application window
	viewer          *ui.ImageViewer  // Image viewer component
	helpText        *widget.RichText // Help text widget
	statusContainer *fyne.Container  // Container for status information
	imageContainer  *widget.Card     // Container for image display
	mainContent     *fyne.Container  // Main content container
}

// NewImageViewerApp creates a new instance of the image viewer application.
// It initializes the Fyne application, window, and all necessary GUI components.
func NewImageViewerApp() *ImageViewerApp {
	myApp := app.New()
	myApp.SetIcon(nil)

	window := myApp.NewWindow(AppTitle)
	window.SetFullScreen(true)

	viewer := ui.NewImageViewer(MaxMemoryBytes)

	// Create help text
	helpText := widget.NewRichText(&widget.TextSegment{
		Text: `High-Speed Image Viewer - Keyboard Commands:

• 'o' - Open directory to load images
• 'n' - Next image
• 'b' - Previous image
• 'h' - Show this help dialog
• 'f' - Toggle fullscreen/windowed mode
• 'q' - Quit application

Memory Management:
• Maximum memory usage: 3GB
• Concurrent loading when possible
• Sequential loading for large directories
• Real-time memory tracking

Supported formats: JPEG, PNG, GIF, BMP, TIFF, WebP`,
		Style: widget.RichTextStyle{},
	})

	return &ImageViewerApp{
		app:      myApp,
		window:   window,
		viewer:   viewer,
		helpText: helpText,
	}
}

// setupUI initializes the main user interface layout.
// It creates the main content area with status and image containers.
func (iva *ImageViewerApp) setupUI() {
	// Create main layout components
	iva.statusContainer = iva.viewer.GetStatusContainer()
	iva.imageContainer = iva.viewer.GetImageContainer()

	// Main content area without side panel
	iva.mainContent = container.NewBorder(
		iva.statusContainer, // top
		nil,                 // bottom
		nil,                 // left
		nil,                 // right
		iva.imageContainer,  // center
	)

	iva.window.SetContent(iva.mainContent)
}

// hideStatus hides the status container from the main UI.
// This is typically called when displaying an image in full-screen mode.
func (iva *ImageViewerApp) hideStatus() {
	iva.mainContent = container.NewBorder(
		nil,                // top (no status)
		nil,                // bottom
		nil,                // left
		nil,                // right
		iva.imageContainer, // center
	)
	iva.window.SetContent(iva.mainContent)
}

// showStatus shows the status container in the main UI.
// This is typically called during loading operations or when status information is needed.
func (iva *ImageViewerApp) showStatus() {
	iva.mainContent = container.NewBorder(
		iva.statusContainer, // top
		nil,                 // bottom
		nil,                 // left
		nil,                 // right
		iva.imageContainer,  // center
	)
	iva.window.SetContent(iva.mainContent)
}

// setupKeyboardShortcuts configures keyboard event handlers for the application.
// It sets up key bindings for navigation, help, fullscreen, and quit operations.
func (iva *ImageViewerApp) setupKeyboardShortcuts() {
	iva.window.Canvas().SetOnTypedKey(func(key *fyne.KeyEvent) {
		switch key.Name {
		case fyne.KeyO:
			iva.openDirectoryDialog()
		case fyne.KeyN:
			iva.nextImage()
		case fyne.KeyB:
			iva.previousImage()
		case fyne.KeyH:
			iva.showHelp()
		case fyne.KeyQ:
			iva.app.Quit()
		case fyne.KeyF:
			iva.toggleFullscreen()
		}
	})
}

// openDirectoryDialog opens a directory selection dialog and loads images from the selected directory.
// It handles the loading process asynchronously to keep the UI responsive.
func (iva *ImageViewerApp) openDirectoryDialog() {
	dialog.ShowFolderOpen(iva.handleDirectorySelection, iva.window)
}

// handleDirectorySelection processes the selected directory from the folder dialog.
func (iva *ImageViewerApp) handleDirectorySelection(uri fyne.ListableURI, err error) {
	if err != nil {
		dialog.ShowError(err, iva.window)
		return
	}
	if uri == nil {
		return // User cancelled
	}

	dirPath := uri.Path()
	fmt.Printf("Loading images from directory: %s\n", dirPath)

	iva.loadImagesFromDirectory(dirPath)
}

// loadImagesFromDirectory loads images from the specified directory with a loading dialog.
func (iva *ImageViewerApp) loadImagesFromDirectory(dirPath string) {
	// Show loading dialog
	loadingLabel := widget.NewLabel("Loading images...")
	loadingDialog := dialog.NewCustom("Loading", "Cancel", loadingLabel, iva.window)
	loadingDialog.Show()

	// Show status during loading
	iva.showStatus()

	// Load images in goroutine to keep UI responsive
	go func() {
		err := iva.viewer.LoadImages(dirPath)

		// Close loading dialog and handle errors on UI thread
		fyne.DoAndWait(func() {
			loadingDialog.Hide()

			if err != nil {
				dialog.ShowError(fmt.Errorf("failed to load images: %w", err), iva.window)
				return
			}

			// Update display with first image
			iva.updateImageDisplay()
		})
	}()
}

// nextImage navigates to the next image in the sequence.
// It shows an information dialog if no images are loaded.
func (iva *ImageViewerApp) nextImage() {
	if !iva.viewer.HasImages() {
		dialog.ShowInformation("No Images", "Please open a directory first (press 'o')", iva.window)
		return
	}

	err := iva.viewer.NextImage()
	if err != nil {
		fmt.Printf("Error navigating to next image: %v\n", err)
		return
	}

	iva.updateImageDisplay()
}

// previousImage navigates to the previous image in the sequence.
// It shows an information dialog if no images are loaded.
func (iva *ImageViewerApp) previousImage() {
	if !iva.viewer.HasImages() {
		dialog.ShowInformation("No Images", "Please open a directory first (press 'o')", iva.window)
		return
	}

	err := iva.viewer.PreviousImage()
	if err != nil {
		fmt.Printf("Error navigating to previous image: %v\n", err)
		return
	}

	iva.updateImageDisplay()
}

// updateImageDisplay updates the image display and manages UI state.
// It hides the status when an image is successfully displayed and updates the window title.
func (iva *ImageViewerApp) updateImageDisplay() {
	err := iva.viewer.UpdateImageDisplay()
	if err != nil {
		fmt.Printf("Error updating image display: %v\n", err)
		dialog.ShowError(fmt.Errorf("failed to display image: %w", err), iva.window)
		return
	}

	// Hide status and update title when image is successfully displayed
	if iva.viewer.HasImages() {
		iva.hideStatus()
		iva.updateWindowTitle()
	}
}

// updateWindowTitle updates the window title with current image information.
// It displays the filename, current position, and total count if images are loaded.
func (iva *ImageViewerApp) updateWindowTitle() {
	if !iva.viewer.HasImages() {
		iva.window.SetTitle(AppTitle)
		return
	}

	currentImage, err := iva.viewer.GetCurrentImage()
	if err != nil {
		iva.window.SetTitle(AppTitle)
		return
	}

	filename := filepath.Base(currentImage.Path)
	title := fmt.Sprintf("%s - %s (%d/%d)",
		AppTitle, filename,
		iva.viewer.GetCurrentIndex()+1,
		iva.viewer.GetImageCount())
	iva.window.SetTitle(title)
}

// toggleFullscreen toggles between fullscreen and windowed mode.
// In windowed mode, it sets a default size and centers the window.
func (iva *ImageViewerApp) toggleFullscreen() {
	isFullscreen := iva.window.FullScreen()
	if isFullscreen {
		// Exit fullscreen and set to a large windowed size
		iva.window.SetFullScreen(false)
		iva.window.Resize(fyne.NewSize(1920, 1080))
		iva.window.CenterOnScreen()
	} else {
		// Enter fullscreen
		iva.window.SetFullScreen(true)
	}
}

// showHelp displays the help dialog with keyboard commands and usage information.
func (iva *ImageViewerApp) showHelp() {
	dialog.ShowCustom("Help - Keyboard Commands", "Close", iva.helpText, iva.window)
}

// Run starts the application by setting up the UI and keyboard shortcuts, then showing the window.
func (iva *ImageViewerApp) Run() {
	iva.setupUI()
	iva.setupKeyboardShortcuts()
	iva.window.ShowAndRun()
}

func main() {
	app := NewImageViewerApp()

	fmt.Printf("Starting %s with %d MB memory limit\n",
		AppTitle, MaxMemoryBytes/(1024*1024))
	fmt.Println("Press 'o' to open a directory and start viewing images")

	app.Run()
}
