# files-changed-local

A local web app that renders a GitHub-style **"Files changed"** view for comparing two branches of a local git repository.

It shells out to the `git` CLI on the server and renders the diff in your browser — nothing is persisted server-side, and no repository data ever leaves your machine.

## Requirements

- **macOS** — the directory picker uses `osascript` (Finder's folder chooser)
- **Node.js** 22+
- **git** available on your `PATH`

## Getting started

```bash
npm install
npm run dev        # dev server with HMR at http://localhost:5173
```

For a production build:

```bash
npm run build      # outputs to build/
npm run start      # serves the production build
```

To verify changes (there is no test suite or linter):

```bash
npm run typecheck  # react-router typegen && tsc
```

## Usage

1. Open the app and pick a local git repository (via the Finder folder picker, or by entering a path).
2. Choose a **base** and **head** branch. Defaults: base falls back to `main`, then `master`; head defaults to the current branch.
3. Browse the diff — the URL encodes the comparison as `?repo=&base=&head=`, so it's shareable/bookmarkable on your machine.

The comparison uses the **three-dot range** (`base...head`, i.e. diff against the merge base) to match GitHub pull request semantics.

### Features

- GitHub-style file tree, per-file diff sections, and diff stats bar
- Collapsible files, with large/binary files collapsed by default (collapse state remembered per `repo|base|head`)
- Highlights added lines containing `TODO / TBD / FIXME / TMP / TEMP / WIP` markers
- Font settings (UI/code font family and size) persisted to localStorage

## Stack

- [React Router v7](https://reactrouter.com/) (framework mode, SSR)
- React 19
- Tailwind CSS v4 (via the Vite plugin; theme lives in `app/app.css`)
- TypeScript (strict)

## Architecture

Data flows one way: URL search params → server loader → typed props → presentational components. There is no client-side data fetching for diffs and no API layer.

- `app/routes/home.tsx` — the single loader: validates the repo, resolves branch defaults, and returns a `stage: "empty" | "error" | "ready"` discriminated union
- `app/lib/git.server.ts` — server-only git wrapper using `execFile`; runs `diff --name-status -z` (authoritative paths/statuses) and `diff` (patch text) in parallel
- `app/lib/diff-parser.ts` — parses the unified diff into `FileDiff[]`, zipping patch files with name-status entries by index
- `app/components/` — presentational components; cross-cutting client state lives in `app/hooks/`

### Security & correctness

- Branch names are validated against `git branch` output before being passed to git (injection guard)
- All subprocess calls use `execFile` — never `exec` or shell interpolation
- Diff output is capped at 64 MB; larger diffs return a friendly "Diff too large to display" error

## Limitations

- macOS-only directory picker (`osascript`)
- Compares local branches only; no remote fetching
- Read-only — no staging, committing, or commenting
