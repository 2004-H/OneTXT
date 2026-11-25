# OneTXT

I wanted a single, quiet place to keep a long document—notes, technical specs, checklists, code snippets—without juggling folders, accounts, or heavy note apps. OneTXT keeps everything in one Markdown document, saves as you type, and lets you style every heading and element the way you actually want to read it.

## How it works

There are only three buttons floating in a pill at the bottom of the screen:

1. **Read / Source** — Tap once to flip between the rendered document and the raw Markdown editor. In Source mode, there's a small insert bar at the top for quick headings, quotes, code blocks, and tables, plus optional line numbers.
2. **Outline** — Opens a searchable table of contents built from your `H1`–`H6` headings. Tap any heading to jump straight to it (whether you're reading or editing source).
3. **Settings** — Opens the styling studio and backup tools.

## Styling & Themes

Inside **Settings**, you can pick a ready-made preset—including **AMOLED Lime** (true `#000000` black with `limegreen` accents), **Swiss Monograph**, **Obsidian Ink**, **Editorial Manuscript**, **Technical Spec**, and **Forest Study**—or build your own from scratch.

Under **Markdown CSS**, every heading level (`H1` through `H6`) has its own independent controls for font family, size, weight, line height, letter spacing, colors, padding, margins, borders, and extra custom CSS declarations. You can also style paragraphs, blockquotes, inline code, code blocks (10px monospace by default), links, lists, squircle checklists, tables (which automatically scale down to fit your screen without dropping below 9px), dividers, and images, or drop rules straight into the scoped **Raw CSS** editor.

Every fenced code block also puts a **Copy** button in its top-right corner for single-tap copying.

## Backups

Everything stays saved locally in your browser as you write. Whenever you want a hard copy, **Settings → Backup** gives you three options:

- **Text Backup** — Export or import plain `.md` / `.txt` files, or copy the full Markdown text.
- **Theme Backup** — Export or import your CSS styling setup as `.json`, or download the compiled `.css` stylesheet.
- **Full Backup** — Save a `.json` bundle with your text, theme, and editor preferences together, or export a completely self-contained **`OneTXT.html`** file that opens offline in any browser.

## Running locally

```bash
npm install
npm run dev
```

Or just open `OneTXT.html` directly in your browser if you want the single-file version with zero setup.
