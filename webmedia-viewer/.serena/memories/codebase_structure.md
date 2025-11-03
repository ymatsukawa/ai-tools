# Codebase Structure

## Architecture Pattern
Modular design with strict limits: 80 characters/24 lines per function

## Directory Structure

### `/app/types/`
Type definitions and interfaces
- `mediaViewer.ts` - MediaFile, Settings interfaces

### `/app/utils/`
Utility functions
- `cookies.ts` - Cookie get/set helpers
- `fileSystem.ts` - Directory selection and file loading

### `/app/hooks/`
Custom React hooks
- `useSettings.ts` - Settings state and persistence
- `useMediaLoader.ts` - Directory selection and loading
- `useMediaNavigation.ts` - Media navigation state
- `useKeyboardNavigation.ts` - Keyboard event handling
- `useClickOutside.ts` - Click outside detection

### `/app/components/MediaViewer/`
React components for the media viewer
- `index.tsx` - Main orchestrator component
- `TopBar.tsx` - Header with buttons and settings
- `ProgressBar.tsx` - Loading progress indicator
- `ErrorMessage.tsx` - Error display
- `EmptyState.tsx` - No media state
- `MediaGrid.tsx` - Thumbnail grid display
- `NavigationButton.tsx` - Reusable prev/next button
- `MediaModal.tsx` - Full-screen media view
- `SettingsDropdown.tsx` - Settings menu
- `VideoIcon.tsx` - Play icon overlay

### `/app/routes/`
React Router routes
- `home.tsx` - Main page route
- `routes.ts` - Route configuration

### Root Files
- `app/root.tsx` - Root application component
- `app/app.css` - Global styles

## Configuration Files
- `tsconfig.json` - TypeScript strict mode, ES2022 target
- `vite.config.ts` - Vite with React Router, Tailwind, tsconfigPaths
- `react-router.config.ts` - React Router with SSR enabled
- `package.json` - Dependencies and scripts
