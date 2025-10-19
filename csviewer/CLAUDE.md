# csviewer
## GOAL
Showing csv as beautiful and graphical table on browser.

## Features
* (1) User can drag and drop csv to browser because it's more convenient than select file system.
* (2) User can see csv as table
* (3) User can sort table by clicking column headers (numeric or string sorting)
* (4) User can configure settings via gear icon (top-right)
  * Configure separator: comma, semicolon, tab, pipe
  * Configure line break: LF (Unix/Mac), CRLF (Windows), CR (Old Mac)
* (5) User can resize column width by dragging column borders
* (6) Support multi-encoding: UTF-8, Shift_JIS, EUC-JP (auto-detection)
* (7) Proper CSV quote handling (RFC 4180 standard)
  * Removes wrapper quotes from fields
  * Handles escaped quotes ("" becomes ")
  * Respects quoted fields with separators inside
* (8) Fixed header with scrollable data
  * Header stays fixed at the top while scrolling
  * Smooth scrolling for large datasets
  * Maximum viewport height: calc(100vh - 100px)
* (9) Row and header copy as CSV
  * Hover over header to reveal copy button on the left
  * Hover over any data row to reveal copy button on the left
  * Click to copy header/row data as CSV format to clipboard
  * Proper CSV formatting with quote escaping

## NO GOALs or NO features
* Create/Edit csv
* Download csv
* Move columns

## Valid case
* Dropping csv
  * (0-1) csv is dropped
  * (0-2) csv is handled by system
* After dropped csv
  * (1-1) load with auto-encoding detection (UTF-8, Shift_JIS, EUC-JP)
  * (1-2) parse with configured separator and line break
  * (1-3) modeling for table
    * Remove wrapper quotes from fields
    * Handle escaped quotes ("" becomes ")
    * Parse quoted fields with separators inside
* After modeling
  * (2-1) show model as table with fixed column width (default: 200px)
  * (2-2) columns break long text with word-wrap
  * (2-3) header is sticky/fixed at top
  * (2-4) table body scrolls independently (max height: 100vh - 100px)
* Sort table
  * When clicked column of integer or float(double), ascend or descend
  * When clicked column of string, ascend or descend
    * consider boolean is also as string
  * Click again to toggle: asc → desc → unsorted
* Settings (gear icon)
  * (3-1) Open settings modal
  * (3-2) Configure separator (comma, semicolon, tab, pipe)
  * (3-3) Configure line break (LF, CRLF, CR)
  * (3-4) Save settings (applied to subsequent file loads)
* Column resizing
  * (4-1) Hover over column border to show resize cursor
  * (4-2) Drag to resize column width
  * (4-3) Minimum width: 50px
  * (4-4) Text wraps within column boundaries
* Row and header copy
  * (5-1) Hover over header row to reveal copy button (clipboard icon) on the left
  * (5-2) Click button to copy header as CSV format
  * (5-3) Hover over data row to reveal copy button on the left
  * (5-4) Click button to copy row as CSV format
  * (5-5) CSV formatting: cells with commas/quotes/newlines are properly quoted
  * (5-6) Quotes are escaped (doubled) per CSV standard

## Invalid case
* When format is not csv
  * Show modal popup "It's not .csv"
  * Triggered when non-.csv file is dropped
* When csv is broken
  * Show modal popup "CSV format is broken"
  * Triggered when file cannot be read or parsed
* When separator is not found
  * Show modal popup "Seperator {seperator} does not found"
  * Triggered when configured separator doesn't exist in file
* All application error modals
  * Display with red error header
  * Centered on screen with overlay
  * User must click "Close" button to dismiss
  * User can continue using the app after dismissing

## System Error Handling
* ErrorBoundary catches system-level errors:
  * React component rendering errors
  * JavaScript runtime errors
  * Uncaught exceptions in component lifecycle
* System error display:
  * Full-screen error page with warning icon
  * Shows error details for debugging
  * "Reload Application" button to reset the app
* Note: ErrorBoundary does NOT catch:
  * Application-level errors (CSV parsing, validation)
  * Event handler errors (handled by try-catch)
  * Async errors (handled by error states)

## Path
* `/` main. drag and drop is enabled

## Restriction
* running local only

## Architecture
* Component structure:
  * `app/components/ErrorBoundary.tsx` - System error boundary (catches React/JS errors)
  * `app/components/ErrorModal.tsx` - Application error modal (CSV parsing errors)
  * `app/components/CsvDropZone.tsx` - Drag & drop zone
  * `app/components/CsvTable.tsx` - Table rendering component (presentation only)
  * `app/components/SettingsModal.tsx` - Settings configuration modal
* SVG components:
  * `app/components/svg/GearIcon.tsx` - Settings gear icon
  * `app/components/svg/ClipboardIcon.tsx` - Copy to clipboard icon
  * `app/components/svg/WarningIcon.tsx` - Error warning triangle icon
* Hook structure:
  * `app/hooks/useCsvParser.ts` - CSV parsing logic with encoding support
  * `app/hooks/useSettings.ts` - Settings state management
  * `app/hooks/useColumnResize.ts` - Column resizing logic
  * `app/hooks/useTableSort.ts` - Table sorting logic (numeric & string)
  * `app/hooks/useCsvCopy.ts` - CSV copy to clipboard logic
* Main components:
  * `app/main/csv_render.tsx` - Main orchestrator component
  * `app/routes/home.tsx` - Root route with ErrorBoundary wrapper

## Technical Details
* Default settings:
  * Separator: `,` (comma)
  * Line break: `LF` (Unix/Mac)
  * Column width: `200px`
* Encoding library: `encoding-japanese` for proper Shift_JIS/UTF-8 handling
* CSV parsing: Custom RFC 4180 compliant parser
* Table layout: Fixed layout with resizable columns via drag
* Styling: Tailwind CSS
