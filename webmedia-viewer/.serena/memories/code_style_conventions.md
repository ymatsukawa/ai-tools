# Code Style and Conventions

## TypeScript
- **Strict mode enabled**: All TypeScript strict checks active
- **Module system**: ES2022 with ESM modules
- **Type annotations**: Explicit types for props, return values, and complex objects
- **Interface naming**: PascalCase (e.g., `MediaFile`, `Settings`)
- **Props interfaces**: Component name + "Props" suffix (e.g., `ProgressBarProps`)

## React Conventions
- **Functional components only**: No class components
- **Named exports**: Components exported as named (e.g., `export const ProgressBar`)
- **Hook prefix**: Custom hooks start with "use" (e.g., `useSettings`)
- **Props destructuring**: Inline destructuring in component parameters

## File Organization
- **One component per file**: Each component in its own file
- **Type definitions**: Separate `/types/` directory for shared interfaces
- **Related files grouped**: Components in `/components/`, hooks in `/hooks/`, etc.

## Naming Conventions
- **Components**: PascalCase (e.g., `MediaViewer`, `ProgressBar`)
- **Hooks**: camelCase with "use" prefix (e.g., `useSettings`, `useMediaLoader`)
- **Utilities**: camelCase (e.g., `loadSettings`, `saveSettings`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `COOKIE_NAME`)
- **Variables**: camelCase (e.g., `selectedIndex`, `medias`)

## Code Structure Limits
- **Function length**: Maximum 24 lines per function
- **Line length**: Maximum 80 characters per line

## Styling
- **CSS Framework**: Tailwind CSS
- **Class naming**: Utility-first approach with Tailwind classes
- **Inline styles**: Used sparingly for dynamic values (e.g., progress width)

## Import Paths
- **Alias**: `~/` maps to `./app/` directory
- **Relative imports**: Used within same directory
- **Absolute imports**: Used for cross-directory imports via `~/`

## Type Safety
- **No any types**: Strict typing throughout
- **Union types**: Used for restricted values (e.g., `'image' | 'video'`)
- **Optional chaining**: Used where appropriate
- **Type inference**: Let TypeScript infer when obvious
