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
│   │   ├── config.js      # public Supabase URL/publishable key
│   │   ├── data/          # editable copy and travel-place data
│   │   └── modules/       # isolated UI behaviours, including Taotao pet state interactions and reveal motion
│   └── images/            # future image assets
├── supabase/schema.sql    # shared comments/likes schema, RLS and RPCs
├── docs/
└── .github/workflows/pages.yml
```

## Extension rules

- Add new page copy or widget data in `assets/js/data/content.js` when possible.
- Add or edit travel destinations, hot recommendations, city-walk entries, and province-to-region mapping in `assets/js/data/places.js`.
- Add new interactions as small files in `assets/js/modules/`, then import them in `assets/js/app.js`. The Taotao sprite state machine, pointer tracking, and click movement live in `pet.js`; quote switching and likes live in `quotes.js`; shared comments/likes use `supabase.js` and fall back to local storage when unconfigured; viewport reveal motion lives in `reveal.js`.
- Add new theme variables in `assets/css/tokens.css`.
- Put reusable component styles in `assets/css/components.css`; keep page-level grids in `assets/css/layout.css`.
- Avoid build tools until the site needs routing, a CMS, or many pages.

## Deployment

The repository publishes as a static site from `main` through GitHub Pages. Because scripts use native ES modules and CSS uses `@import`, paths must remain relative and case-sensitive.


## Shared data

`supabase/schema.sql` creates public comment storage, owner-only shared travel footprints, aggregate-like views, and controlled toggle RPCs. The frontend uses only the public Project URL plus publishable/anon key from `assets/js/config.js`. Row Level Security remains enabled, raw like tables are not exposed to browser roles, and the service-role key is never used client-side.
