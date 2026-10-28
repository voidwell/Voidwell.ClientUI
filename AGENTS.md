# AGENTS.md

Guidance for AI coding agents working in this repository. See [README.md](README.md) for the full human-facing docs.

## Overview

Voidwell.ClientUI is the web front end for [Voidwell](https://voidwell.com): statistics, alerts, maps and a blog for
PlanetSide 2. It is an Angular single-page app, served in production by a small Express server.

## Stack

- Angular 22 (standalone, no NgModules), Angular Material + CDK, Tailwind CSS 4 (via PostCSS)
- NgRx (store + effects) for global state only; signals and RxJS elsewhere
- Leaflet (`@bluehalo/ngx-leaflet`) for maps, D3 for charts
- `angular-auth-oidc-client` (Keycloak, authorization code + PKCE)
- Vitest (`@angular/build:unit-test`), ESLint (`angular-eslint`), TypeScript 6
- Node `^22.22.3 || ^24.15.0 || >=26.0.0` (the production image and CI run Node 26); Express static server in `server/`

## Repository layout

```
app/                  Angular workspace (package.json, angular.json, eslint.config.js)
  src/app/
    core/             singletons; depends on nothing else
      api/            Ps2ApiClient, api-routes, RequestCache, repositories (ps2/, platform/), models/
      auth/           OIDC config, auth service, route guard
      layout/         nav-menu service, header/footer/search
      platform/       selected PS2 platform (pc / ps4us / ps4eu): state, URL guard, nav picker
      store/          root NgRx state (auth)
      util/
    shared/           reusable, stateless; may use core, never features
      ui/             loader, error-message, error-card, tab nav bars, entry-list, countdown
      pipes/  utils/
    features/         one lazy-loaded folder per route area; never import each other
      admin/  blog/
      planetside/     alerts, player, outfit, worlds, map-explorer, item, weapon-tracker, population,
                      player-ranks, bulk-character-stats, events, news, search;
                      plus components/ (shared widgets), data/ (reference-data services), pipes/
  src/styles/         tailwind.css, theme.scss, app.scss, planetside.css
  src/assets/         static assets (map tiles live under assets/img/ps2/tiles, served at /files in prod)
server/               Express server (server.js) that serves the built app
tools/                one-off Python scripts for map tile extraction
Dockerfile            multi-stage production image
```

## Commands

Run from `app/`:

| Command              | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `npm ci`             | Install dependencies                            |
| `npm start`          | Dev server (http://localhost:5000)              |
| `npm test`           | Unit tests once (`ng test --watch=false`)       |
| `npm run lint`       | ESLint; warnings fail (`--max-warnings 0`)      |
| `npm run lint:fix`   | ESLint with autofix                             |
| `npm run build:prod` | Production build into `app/dist`                |
| `npm run serve:prod` | Serve `dist` with the Express server            |

CI (`.github/workflows/build-test.yml`) runs lint, tests, production build and a Docker build. Run lint and tests before
considering work finished.

## Conventions

### Architecture and imports
- Everything is standalone. Each feature exposes a `Routes` array loaded lazily from `app.routes.ts`; feature-scoped
  services/state are provided on the feature route (see `features/planetside/planetside.routes.ts`).
- Use the `@core/*`, `@shared/*`, `@features/*` aliases across areas; use relative imports within an area.
- Dependency direction is enforced by ESLint (`no-restricted-imports`): features → shared → core, never the reverse,
  and features never import other features. Code two features need moves to `shared/` or `core/`.
- One component per file. Dialogs are their own components in a `<name>-dialog/` folder; Material table data sources
  live in `*.data-source.ts` files next to the component.
- A route's component gets its own folder under its feature (`item/stats/`, `item/leaderboard/`), keeping the full
  file name (`planetside-item-stats.component.ts`). What only one view uses (cards, charts, helpers and their specs)
  lives in that view's folder. What several views use stays at the parent: the card that heads the page, or a helper
  two views import. Move files with `git mv`, and update the imports and the lazy route imports to match.

### Type safety
- No `any` (ESLint `no-explicit-any` and `noImplicitAny`). Use the contracts in `core/api/models/`, or `unknown` plus a
  type guard.
- `strictTemplates` is on; templates are type-checked.
- Unused imports are lint errors.

### State
- Prefer signals: parents expose `signal()`s, children use `computed()` / `effect()`. Services expose reference data as
  signals via `toSignal` (e.g. `WorldService.worlds`, `ZoneService.zones`).
- Route and query params arrive as signal inputs (`withComponentInputBinding`), e.g. `readonly id = input<string>()`,
  with an `effect` reloading on change. Do not inject `ActivatedRoute`.
- `BehaviorSubject` only where a CDK table needs a `DataSource`.
- NgRx is reserved for the two global slices (auth, selected platform); read with `store.selectSignal`.

### API layer
- All HTTP lives in `app/src/app/core/api/`. One repository per backend controller, typed models in `models/`.
  Components inject repositories (`inject(PlayerRepository)`) and never build URLs.
- Base URLs derive from the host: `https://api.<host>/ps2` and `/platform` (`api-routes.ts`), so the dev server must be
  reached via a hostname where the `api.` subdomain resolves.
- PS2 requests go through `Ps2ApiClient`, which adds the `platform` query param from the selected platform. Reference
  data identical across platforms opts out with `platform: false`. `RequestCache` caches responses for 30 minutes.
- The URL decides the platform of PlanetSide pages: `platformGuard` (`core/platform/platform-routing.ts`) reads
  `?platform=`, updates the store and saves it to `localStorage`, and redirects URLs without it to the selected
  platform. Links inside the area need not carry the parameter, but a `router.navigate([], { queryParams })` must
  use `queryParamsHandling: 'merge'` so it keeps it. Pages do not watch the platform: the wrapper rebuilds its
  outlet when it changes, so the current page loads again.
- When a backend route or DTO changes, update the matching repository and model together.

### Auth
- Keycloak OIDC (PKCE); settings in `core/auth/auth.config.ts`, wrapper in `core/auth/voidwell-auth.service.ts`.
- Roles come from the `roles` access-token claim and only show/hide UI; the API must enforce authorization.

### Style
- Match surrounding code: 4-space indentation, single quotes, standalone components, Tailwind utilities plus Material
  theming (`styles/theme.scss`). PlanetSide-specific styles go in `styles/planetside.css`.
- Reuse the shared `stat-*` classes in `styles/planetside.css` before writing component CSS; a second copy of a rule
  belongs there, not in another component. They cover: cards and titles (`stat-card`, `stat-toolbar`,
  `stat-title-row`), tables (`stat-table`, `pinned`, `hs`, `stat-expand`/`stat-detail`, `stat-table-bright`), paging and
  search (`stat-pager`, `stat-page-button`, `stat-search`), links and buttons (`stat-link`, `stat-action`, `stat-ghost`),
  text (`stat-muted`, `stat-hint`, `stat-label`, `stat-empty`), pills (`stat-pill`, `stat-badge`), tiles
  (`stat-tile*`, `stat-metric*`, `stat-hero*`, `stat-meter`), charts (`stat-range-bar`, `stat-line-graph`,
  `stat-chart-tooltip`, `stat-swatch`) and header cards (`faction-head-*`, `stat-head-title`).
- Single-choice filters and ranges use `<vw-chips>` (`shared/ui/vw-chips`), not Material button toggles or chip lists.
- Tailwind utilities sit in a CSS layer, so an unlayered rule beats them: a shared class that sets `margin` or `display`
  cannot be adjusted with `mb-3` or `flex`. Leave such properties out of shared classes, and give a rule that must beat
  Material's own (`mat-card-title`, `mat-card`) an element in its selector, as `mat-card-title.stat-title-row` does.

## Design philosophy

Keep new and reworked pages consistent with these principles.

### Layout
- Build pages from cards. A detail page opens with an overview card: a header identifying the subject with
  its headline figure, then its key figures as tiles.
- Navigation is a drill-down: an overview summarises each area and links on to its full page, a list leads to a detail
  page. A breadcrumb trail shows where a page sits and is the way back up; don't add back links, tabs or sideways
  shortcuts alongside it.
- Show lists of comparable records as sortable tables. Tiles are for the figures of a single record.

### Tables
- Keep every column users rely on. Abbreviate headers where space is tight and spell them out on hover.
- Right-align figures with tabular numbers, and keep columns lined up. When something beside a figure is missing,
  hold its space.
- Sort figures high to low on the first click. A value that can't be worked out shows a dash and sorts last.
- On small screens keep only the essential columns. Expandable rows may reveal more, but only what is hidden at the
  current width; never repeat what is already visible.
- A wide table scrolls inside its container with the identifying column pinned. The page itself never scrolls sideways.
- Offer search and filters only when a list is long enough to need them.

### Visual language
- Keep it quiet: low-contrast borders, faint tints, no decorative imagery. Show an image only when it helps identify
  something. Keep meters and charts out of dense lists.
- Inline links on names and labels look like the text, with a faint dashed underline. Navigation links use the accent
  colour.
- Use small, muted pills for tags and categories. Save stronger colour for the one figure or state that matters.
- Show progress compactly and in proportion, rather than with medals or decorations.
- Use solid colours for highlights that can stack or overlap, so layered elements match.
- Show ratings or grades only where real data supports them. Never invent a value to fill a gap.

### Figures
- Progress indicators never overflow: the bar caps at full while the count may exceed the target. Don't add
  "remaining" figures.
- Never add up figures that overlap. When a figure's meaning isn't obvious, say what it counts.
- Compute shared figures with shared helpers so every page agrees, and show missing results as a dash, never NaN or
  Infinity.

### Checking work
- Check every visual change in a browser at desktop and phone widths, with realistic data that includes the awkward
  cases (long names, missing values, zeros, empty lists).
- On small screens, content wraps or stacks and stays aligned. Nothing should scroll the page sideways.

## Deployment

- Docker multi-stage build (`Dockerfile`): builds the app, installs server deps, runs `node server.js` on `SERVER_PORT`
  (default 5000). Files mounted at `/app/public` are served under `/files`.
- Releases: pushing a `vX.Y.Z` tag publishes the image to GHCR (`release.yml`). CodeQL and Dependabot run on a schedule.

## Gotchas

- `app/assets` and `app/src/assets` hold tens of thousands of map tile images; avoid broad globs/greps over them.
- `app/dist` and `node_modules` are build artifacts; do not edit them.
