# jsonviewer

## GOAL
Display and validate JSON in a beautiful, user-friendly interface.

## Features

### Core Features
* (1) **Format JSON** - Pretty-print JSON with proper indentation (2 spaces)
* (2) **Auto-validate JSON** - Real-time validation as you type or paste
  * Invalid lines are highlighted with GitHub-style diff coloring
  * Invalid Format label appears automatically when JSON is invalid
* (3) **Copy JSON** - Copy formatted JSON to clipboard with one click

### Input Methods
* **Direct text input** - Type or paste JSON directly into the editor
* **Drag and drop** - Drop JSON files onto the editor area
* **File selection** - Click "Select File" button to browse for JSON files
* **Multi-encoding support** - Automatic detection and conversion of Shift_JIS/UTF-8

### User Experience
* **Real-time validation** - Validation occurs automatically on every edit
* **Line numbers** - Easy reference with line number gutter
* **Invalid line highlighting** - Red background highlighting for syntax errors (GitHub diff style)
* **Always-ready editor** - Text area is always visible and editable
* **Drag overlay** - Visual feedback when dragging files over the editor

## NO GOALs or NO features
* Download JSON from external server
* Create new JSON from browser (generator)
* Update existing JSON from browser (CRUD operations)
* Delete JSON from browser (CRUD operations)
* JSON schema validation
* JSON to other format conversion

## Behavior Specifications

### Text Input
* User can type directly into the text area
* User can paste JSON into the text area
* Auto-validation triggers on every text change
* Invalid lines are immediately highlighted in red

### Drag and Drop
* User can drag JSON files (.json, .txt) onto the editor
* File encoding is automatically detected and converted
* Dropped file content replaces current text
* Auto-validation occurs after file is loaded

### Format Button
* Parses and pretty-prints the JSON with 2-space indentation
* Shows modal "It's not json" if content is invalid
* Clears invalid line highlighting after successful format

### Copy Button
* Validates JSON before copying
* Copies current text to clipboard
* Shows "Copied to clipboard!" confirmation modal
* Shows modal "It's not json" if content is invalid

### Select File Button
* Opens file browser dialog
* Accepts .json and .txt files
* Same behavior as drag and drop

### Invalid Format Label
* Red text label appears next to "Select File" button
* Only visible when `invalidLines.size > 0`
* Automatically disappears when JSON becomes valid
* No modal popup for validation (silent real-time feedback)

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
* `/` - Main editor page with text input, drag and drop enabled

## Restrictions
* Running local only (no server communication)
* Single JSON document at a time (no multi-document support)

## Technical Details

### Architecture
* **Framework**: React 19 + React Router 7
* **Styling**: Tailwind CSS 4
* **Build**: Vite
* **Type Safety**: TypeScript

### File Structure
```
app/
├── components/
│   ├── json_viewer.tsx      # Main orchestrator component
│   ├── JsonEditor.tsx        # Text area with line numbers and highlighting
│   ├── ButtonBar.tsx         # Toolbar with action buttons
│   ├── Modal.tsx             # Reusable modal component
│   ├── DragOverlay.tsx       # Drag and drop visual indicator
│   └── error_boundary.tsx    # System error boundary
├── hooks/
│   ├── useJsonValidation.ts  # Auto-validation logic
│   └── useFileUpload.ts      # File drop/upload with encoding
└── types/
    └── encoding-japanese.d.ts # TypeScript declarations
```

### Libraries
* `encoding-japanese` - Automatic encoding detection and conversion (Shift_JIS/UTF-8)
* `react-dropzone` - Drag and drop file handling
* `react-router` - Routing and navigation

### Validation Logic
* **Parser**: Native `JSON.parse()` for validation
* **Error detection**: Extracts line number from error message
  * Firefox format: `line X column Y`
  * Chrome format: `position X` (converted to line number)
* **Fallback**: Marks last non-empty line if position cannot be determined
* **Trigger**: `useEffect` hook validates on every `jsonText` change

### Highlighting Implementation
* **Line numbers**: Red background (`bg-red-200`) and red text (`text-red-700`)
* **Line content**: Red background (`bg-red-100`) on entire line
* **Method**: Absolute positioned highlight layer behind transparent textarea
* **Performance**: Only highlights lines in `invalidLines` Set

## Code Quality
* **Separation of Concerns**: Logic in hooks, UI in components
* **Reusability**: All hooks and components are reusable
* **Type Safety**: Full TypeScript coverage with strict mode
* **Maintainability**: Clean component hierarchy, single responsibility principle
