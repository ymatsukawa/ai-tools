# Media Viewer

## GOAL
Local media viewer for images and videos

## Features

### Core Features
* (0) Select target directory - select directory with media files
* (1) Show media on tiles - thumbnails displayed in grid
* (2) View media full-screen - click tile to zoom image or play video
* (3) Navigate between media - prev/next buttons and keyboard shortcuts
* (4) Video playback - full video player with native controls

### Media Support
* **Images**: All browser-supported formats (jpg, png, gif, webp, etc.)
* **Videos**: mp4, mov, and all browser-supported video formats
* **Video thumbnails**: Native browser first-frame display with play icon

### Input Methods
* Sticky top bar with:
  * "Select Directory" button - opens directory picker
  * Settings gear icon - toggle display options

### Navigation
* **Mouse**:
  * Click media to advance to next
  * Click prev/next buttons on sides
  * Click background to close modal
* **Keyboard**:
  * Arrow Left (←) - Previous media
  * Arrow Right (→) - Next media
  * Escape (Esc) - Close modal view

### Settings (Persistent via Cookies)
* Show/hide media title
* Show/hide media counter (X / Total)

### User Experience
* **Progress is shown** - Loading progress bar with percentage
* **Can watch tiled thumbnails** - Grid view with image/video thumbnails
* **Can watch original media** - Full-screen view without switching tabs
* **Video play icon** - Videos show centered play icon overlay
* **Expanded click areas** - Large prev/next areas for easy navigation
* **Wrap-around navigation** - Last item → First item, First → Last

## NO GOALs or NO features
* From remote web server, external network(local only)

## System Error Handling

### ErrorBoundary Component
* Catches system-level errors:
  * React component rendering errors
  * JavaScript runtime errors
  * Uncaught exceptions in component lifecycle
* System error display:
  * Full-screen error page with warning icon
  * Shows error details for debugging
  * "Reload Application" button to reset the app
* Note: ErrorBoundary does NOT catch:
  * Application-level errors (handled by try-catch)
  * Event handler errors (handled by try-catch)
  * Async errors (handled by error states)

## Routes
* `/` - Main page

## Restrictions
* Running local only (no server communication)

## Architecture

### Codebase Structure (Modular Design)
All code follows 80 characters/24 lines limits per function.

**Types** (`app/types/`):
* `mediaViewer.ts` - MediaFile, Settings interfaces

**Utils** (`app/utils/`):
* `cookies.ts` - Cookie get/set helpers
* `fileSystem.ts` - Directory selection and file loading

**Hooks** (`app/hooks/`):
* `useSettings.ts` - Settings state and persistence
* `useMediaLoader.ts` - Directory selection and loading
* `useMediaNavigation.ts` - Media navigation state
* `useKeyboardNavigation.ts` - Keyboard event handling
* `useClickOutside.ts` - Click outside detection

**Components** (`app/components/MediaViewer/`):
* `index.tsx` - Main orchestrator component
* `TopBar.tsx` - Header with buttons and settings
* `ProgressBar.tsx` - Loading progress indicator
* `ErrorMessage.tsx` - Error display
* `EmptyState.tsx` - No media state
* `MediaGrid.tsx` - Thumbnail grid display
* `NavigationButton.tsx` - Reusable prev/next button
* `MediaModal.tsx` - Full-screen media view
* `SettingsDropdown.tsx` - Settings menu
* `VideoIcon.tsx` - Play icon overlay

### Technical Implementation

**Browser APIs Used**:
* **File System Access API** - For directory selection
  * Browser prompts for permission each time (security feature)
  * Works in Chrome, Edge, Opera (not Firefox/Safari)
* **URL.createObjectURL** - For efficient file loading
  * Automatic cleanup on component unmount
* **Native Video Element** - For video thumbnails
  * Uses `preload="metadata"` for first frame
  * Lightweight, no canvas processing required

**State Management**:
* React hooks for local state
* Cookie storage for settings persistence (365 days)
* No external state management library needed
