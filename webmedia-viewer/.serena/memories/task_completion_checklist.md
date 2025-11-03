# Task Completion Checklist

When completing a coding task, follow these steps:

## 1. Type Checking (REQUIRED)
```bash
npm run typecheck
```
- Ensures no TypeScript errors
- Verifies type safety across the codebase
- Must pass before considering task complete

## 2. Build Verification (RECOMMENDED)
```bash
npm run build
```
- Confirms the project builds successfully
- Catches runtime issues that might not appear in type checking
- Run if changes affect multiple files or core functionality

## 3. Manual Testing (REQUIRED)
Since there are no automated tests:
```bash
npm run dev
```
- Start the dev server
- Test the modified functionality in the browser
- Verify the feature works as expected
- Test edge cases and error handling

## 4. Code Style Verification (MANUAL)
Check that your code follows project conventions:
- Functions are ≤24 lines
- Lines are ≤80 characters
- Proper TypeScript types (no `any`)
- Named exports for components
- Props interfaces named with "Props" suffix
- Tailwind CSS for styling

## 5. Browser Compatibility
- Test in Chrome, Edge, or Opera
- Remember: Firefox/Safari not supported (File System Access API)

## Notes
- No ESLint, Prettier, or test runner configured
- Type checking is the primary automated verification
- Manual browser testing is critical
