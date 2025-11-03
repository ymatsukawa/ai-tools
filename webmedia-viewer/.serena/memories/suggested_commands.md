# Suggested Commands

## Development Commands

### Start Development Server
```bash
npm run dev
```
Starts the React Router development server with hot reload.

### Build for Production
```bash
npm run build
```
Creates optimized production build in `./build/` directory.

### Start Production Server
```bash
npm run start
```
Serves the production build using React Router serve.

### Type Checking
```bash
npm run typecheck
```
Runs React Router type generation and TypeScript compiler checks.

## Testing
No test framework is currently configured in this project.

## Linting & Formatting
No linter or formatter is currently configured in this project.

## Git Commands (Darwin/macOS)
```bash
git status
git add .
git commit -m "message"
git push
```

## File System Commands (Darwin/macOS)
```bash
ls -la                  # List files with details
cd path/to/dir          # Change directory
find . -name "*.ts"     # Find TypeScript files
grep -r "pattern" .     # Search for pattern
```

## Docker (if needed)
```bash
docker build -t webmedia-viewer .
docker run -p 3000:3000 webmedia-viewer
```
A Dockerfile is present in the project root.
