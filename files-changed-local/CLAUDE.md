# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

`files-changed-local` — a local web app that renders a GitHub-style "Files changed" view for comparing two branches of a local git repository. It shells out to the `git` CLI on the server; nothing is persisted server-side. The directory picker (`/pick-directory`) uses `osascript`, so it is **macOS-only**.

## Commands

```bash
npm run dev        # dev server with HMR at http://localhost:5173
npm run build      # production build to build/
npm run start      # serve the production build
npm run typecheck  # react-router typegen && tsc — run this to verify changes
```

There is no test suite and no linter; `npm run typecheck` is the verification step. Route types (e.g. `./+types/home`) are generated into `.react-router/types/` by `react-router typegen`, which `typecheck` runs first — if route imports fail to resolve, run typegen.

## Stack

React Router v7 (framework mode, SSR enabled, all v8 future flags on), React 19, Tailwind CSS v4 (via the Vite plugin; no tailwind.config — theme lives in `app/app.css`), TypeScript strict. Path alias `~/*` → `app/*`.

## Architecture

Data flows one way: URL search params → loader (server) → typed props → presentational components. There is no client-side data fetching for diffs and no API layer; everything happens in the single `home.tsx` loader.

1. **`app/routes/home.tsx` loader** reads `?repo=&base=&head=` from the URL, validates the repo, resolves defaults (base: `main` then `master`; head: current branch), and returns a `LoaderResult` discriminated union (`stage: "empty" | "error" | "ready"` — see `app/types/diff.ts`). The component branches purely on `stage`.
2. **`app/lib/git.server.ts`** (server-only via the `.server` suffix) wraps `execFile("git", ...)`. Two parallel calls per compare: `diff --name-status -z` (authoritative paths/statuses, NUL-delimited to handle spaces/renames) and `diff` (the patch text). Uses the **three-dot range** (`base...head`, merge-base diff) to match GitHub PR semantics. Errors are normalized into `GitError`.
3. **`app/lib/diff-parser.ts`** parses the unified diff into `FileDiff[]`. Files in the patch are zipped with name-status entries **by index** — the `diff --git` header is never parsed for paths (ambiguous with spaces). If you change the diff git args, keep both commands' file ordering identical.
4. **Components** (`app/components/`) are presentational; cross-cutting client state lives in hooks (`app/hooks/`): collapse state keyed by `repoPath|base|head` (`useCollapsedFiles` — large/binary files start collapsed), scroll-to-file refs, and font settings.

### Security / correctness invariants

- Branch names are only passed to git after checking membership in `listBranches()` output (injection guard in the loader). Keep this if adding new ref inputs.
- All subprocess calls use `execFile` (never `exec`/shell interpolation).
- Diff output is capped at 64 MB `maxBuffer`; overflow becomes a friendly `GitError("Diff too large to display")`.

### Font settings

`useFontSettings` persists to localStorage and applies settings by mutating `:root`: Tailwind v4 resolves font utilities through `--font-sans`/`--font-mono` custom properties, UI size sets the root `font-size` (rem-scaled layout), and code size is a separate `--app-code-size` px variable so the diff area doesn't scale with UI size. Non-default fonts load via a dynamically managed Google Fonts `<link>`.

## Styling conventions

GitHub light-theme colors are hardcoded as hex arbitrary values (e.g. `text-[#57606a]`, `border-[#d0d7de]`, green `#1f883d`) rather than a Tailwind palette — match these when adding UI.
