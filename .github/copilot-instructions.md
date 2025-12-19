<!-- Project-specific Copilot instructions. Keep concise and actionable. -->
# Copilot instructions for the admin app

Purpose
- Help contributors and AI agents understand the minimal Vite + React + TypeScript admin frontend, common workflows, and patterns to follow when editing or extending the app.

Big picture
- Single-page React app built with Vite and TypeScript. Entry point: src/main.tsx. Root component: src/App.tsx.
- Static assets served from public/ and referenced by plain paths in index.html or code.
- Build uses a two-step TypeScript build then Vite: `npm run build` -> `tsc -b && vite build` (see package.json).

Key files to inspect (examples)
- package.json — scripts and dependencies.
- vite.config.ts — Vite plugin configuration.
- src/main.tsx — app bootstrap (createRoot, StrictMode).
- src/App.tsx — top-level component and simple example of styles import.
- src/index.css, src/App.css — global and component styles.
- index.html — HTML shell and root element.

Developer workflows
- Start dev server: `npm run dev` (uses Vite with HMR).
- Build for production: `npm run build` (runs `tsc -b` then `vite build`).
- Preview production build: `npm run preview`.
- Lint: `npm run lint` (runs eslint over the repo).

Project-specific conventions and patterns
- File extensions: use .tsx for React components and .ts for helpers.
- Import styles at the top of components (example: `import './App.css'` in src/App.tsx).
- Keep all UI code in `src/`. Small feature additions should add a folder under `src/` (e.g., `src/components/YourWidget`).
- No server/backend code lives in this repo; integrations are via external APIs and should be added behind a clearly named service module (e.g., `src/services/api.ts`).
- TypeScript project build: `tsc -b` suggests project-references or composite setup—if you add new tsconfig targets, update references accordingly.

What to do when adding features (short checklist)
- Add components under `src/` with `.tsx` extension and colocated styles if needed.
- Export types from `src/types` or local module when they are shared across components.
- Update Vite config only when you need custom plugins or dev server options (`vite.config.ts`).
- Run `npm run lint` and fix warnings before opening a PR.

Patterns to follow for PRs and edits
- Keep PRs small and focused; run the dev server and verify HMR reloads the changed component.
- Include a short testing note in the PR description: local steps to reproduce the change (commands and the page/route to check).

Known gaps (for human reviewers)
- There are no tests in this repo; expect manual verification steps on PRs.
- If you add background jobs, APIs, or new build steps, document them in README.md.

When in doubt
- Inspect the minimal examples: src/main.tsx and src/App.tsx to match project style and import patterns.
- Ask maintainers to add a service or testing harness before introducing large architectural changes.

End of file.
