# Docs App

This workspace contains the Cerramos documentation site. It is the curated entry point for product documentation, operating notes, and imported reference material that still needs to remain accessible inside the repo.

## Stack

- Next.js App Router
- Fumadocs content pipeline
- GeistDocs UI patterns and layout conventions

## Content Location

All documentation content lives under `docs/content/docs`.

- `.md` and `.mdx` files define the pages
- folder structure becomes the docs URL structure
- `meta.json` controls section titles, grouping, and sidebar order

This repo currently mixes two kinds of content:

- curated Cerramos docs written directly for the product and team
- imported legacy reference material, including the `pagopar-docs` section

## Local Development

From the repo root:

```bash
bun dev --filter docs
```

From the `docs/` app directory:

```bash
bun dev
```

Useful app-level commands:

```bash
bun dev
bun build
bun start
```

After dependency changes, the docs app also runs `fumadocs-mdx` on postinstall to refresh generated content metadata.

## How Navigation Works

Fumadocs reads `docs/content/docs` as the source of truth.

- page filenames determine slugs
- folder names determine section paths
- `meta.json` files define ordered navigation for a folder
- page frontmatter defines page-level metadata such as `title`, `description`, `summary`, `type`, `related`, and similar fields

If a section needs a curated landing page, add or update its `index.md` or `index.mdx` file inside the section directory.

## Pagopar Legacy Material

`docs/content/docs/pagopar-docs` contains imported Pagopar reference documents. These files are exposed through the same docs site, but they should be treated as legacy source material rather than as the canonical Cerramos product spec.

The landing page for that section should stay curated:

- preserve existing article slugs when possible
- group links so the archive is easier to scan
- avoid rewriting imported articles unless there is a deliberate normalization pass
