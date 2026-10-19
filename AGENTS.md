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

## Deployment

- Docker multi-stage build (`Dockerfile`): builds the app, installs server deps, runs `node server.js` on `SERVER_PORT`
  (default 5000). Files mounted at `/app/public` are served under `/files`.
- Releases: pushing a `vX.Y.Z` tag publishes the image to GHCR (`release.yml`). CodeQL and Dependabot run on a schedule.

## Gotchas

- `app/assets` and `app/src/assets` hold tens of thousands of map tile images; avoid broad globs/greps over them.
- `app/dist` and `node_modules` are build artifacts; do not edit them.
