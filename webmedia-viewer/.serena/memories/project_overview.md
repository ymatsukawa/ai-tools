# Project Overview

## Purpose
Local media viewer for images and videos that runs in a browser. Users can select a directory containing media files and view them in a tile grid or full-screen mode.

## Tech Stack
- **Frontend Framework**: React 19.1.1 with React Router 7.9.2
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.13
- **Language**: TypeScript 5.9.2 (strict mode enabled)
- **Server**: Node.js with @react-router/node and @react-router/serve
- **SSR**: Server-side rendering enabled by default

## Key Features
- Directory selection via File System Access API
- Grid view with thumbnails for images and videos
- Full-screen modal view for media
- Video playback with native controls
- Keyboard navigation (arrow keys, escape)
- Persistent settings stored in cookies (365 days)
- Loading progress indicator
- No remote server communication (local only)

## Browser Compatibility
- Works in Chrome, Edge, Opera (File System Access API)
- Not supported in Firefox/Safari (API limitation)
