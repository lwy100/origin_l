# Architecture

This site is a static, dependency-free GitHub Pages project. It is structured like a small frontend app while keeping direct browser execution.

## Directory layout

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   ├── main.css       # CSS entrypoint
│   │   ├── tokens.css     # theme variables
│   │   ├── base.css       # resets, shared primitives
│   │   ├── layout.css     # page layout and sections
│   │   └── components.css # cards, controls, widgets
│   ├── js/
│   │   ├── app.js         # JavaScript entrypoint
│   │   ├── data/          # editable copy and travel-place data
│   │   └── modules/       # isolated UI behaviours
│   └── images/            # future image assets
├── docs/
└── .github/workflows/pages.yml
```

## Extension rules

- Add new page copy or widget data in `assets/js/data/content.js` when possible.
- Add or edit travel destinations, hot recommendations, city-walk entries, and province-to-region mapping in `assets/js/data/places.js`.
- Add new interactions as small files in `assets/js/modules/`, then import them in `assets/js/app.js`.
- Add new theme variables in `assets/css/tokens.css`.
- Put reusable component styles in `assets/css/components.css`; keep page-level grids in `assets/css/layout.css`.
- Avoid build tools until the site needs routing, a CMS, or many pages.

## Deployment

The repository publishes as a static site from `main` through GitHub Pages. Because scripts use native ES modules and CSS uses `@import`, paths must remain relative and case-sensitive.
