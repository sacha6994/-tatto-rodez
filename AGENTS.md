# AGENTS.md

## Cursor Cloud specific instructions

This is a static portfolio website for a tattoo studio ("Redmoon Tattoo"), built with a custom Node.js SSG (zero npm dependencies).

### Build & Serve

- **Build**: `node build.js` — reads content JSON from `content/`, injects gallery/review cards into `index.html`, outputs to `public/`.
- **Dev server**: No built-in dev server. Use `npx serve public -l 3000` after building to preview locally.
- **No linter or test suite** is configured in this project.

### Key architecture notes

- Zero npm dependencies — `package.json` has no `dependencies` or `devDependencies`. No `npm install` needed.
- Node.js >= 18 required (uses built-in `fs`, `path` only).
- Content lives in `content/gallery/*.json`, `content/reviews/*.json`, and `content/settings.json`.
- Build output (`public/`) is gitignored; always run `node build.js` before serving.
- Decap CMS admin panel (`admin/`) requires Netlify Identity and won't work locally without Netlify's auth backend.
