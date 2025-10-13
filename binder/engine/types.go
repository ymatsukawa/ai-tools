package engine

// ImageData represents a single image with its metadata and optional in-memory data.
// Fields are ordered by decreasing size to minimize struct padding.
type ImageData struct {
	Data     []byte // Image data when loaded in memory
	Path     string // Full file path to the image
	FileSize uint64 // Size of the image file in bytes
	IsLoaded bool   // Whether the image data is currently loaded in memory
}
