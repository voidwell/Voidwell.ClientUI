# Voidwell.ClientUI

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/voidwell/voidwell.clientui/build-test.yml?branch=main&style=for-the-badge)](https://github.com/voidwell/voidwell.clientui/actions/workflows/build-test.yml)
[![Latest Release](https://img.shields.io/github/v/release/voidwell/voidwell.clientui?style=for-the-badge)](https://github.com/voidwell/voidwell.clientui/releases/latest)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

The web front end for [Voidwell](https://voidwell.com): statistics, alerts, maps and more for PlanetSide 2.
It is an Angular single-page app served by a small Express server.

## Stack

- Angular 22, Angular Material, NgRx (store + effects), RxJS
- Leaflet (maps), D3
- Vitest (via `@angular/build:unit-test`) and ESLint (`angular-eslint`)
- Node 22 / Express 5 static server (`server/`)

## Project layout

```
app/                 Angular workspace (package.json, angular.json)
  src/app/
    core/            singletons, loaded once; depends on nothing else
      api/           ApiClient, routes, request cache, every repository and its models
      auth/          OIDC auth service and route guard
      layout/        header, navigation, footer, search and nav-menu services
      platform/      selected PS2 platform state (feeds the Ps2ApiClient)
      store/         root NgRx state (auth, registration)
      util/          error-message helper
    shared/          reusable, stateless; may use core, never features
      ui/            loader, error message, tab bars, entry list, countdown
      pipes/  utils/
    features/        one folder per lazy-loaded route area; never import each other
      account/  admin/  blog/
      planetside/    one folder per route area (player/, alerts/, worlds/ ...), plus
                     components/ widgets used by several areas, data/ reference-data services
                     and configs, pipes/ for the ps2 pipes
  assets/            map tiles served at /files in production (not baked into the image)
server/              Express server that serves the built app
tools/               one-off data scripts (map tile extraction)
Dockerfile           multi-stage production image
```

The app is fully standalone: there are no NgModules. It bootstraps with `bootstrapApplication` (`app.config.ts`), each
feature exposes a `Routes` array that the app loads lazily, and feature-scoped services and state are provided on the
feature route (see `features/planetside/planetside.routes.ts`).

Inside a feature, each routed component sits next to its helpers: dialogs are their own components in a
`<name>-dialog/` folder, and Material table data sources live in `*.data-source.ts` files, so a component file holds
one component.

Imports across areas use the `@core/*`, `@shared/*` and `@features/*` aliases; imports inside an area stay
relative. The dependency direction is enforced by ESLint (`no-restricted-imports` in `app/eslint.config.js`):
features may use shared and core, shared may use core, and core uses neither. Code that two features need
moves down into `shared/` or `core/`.

## Getting started

Requires Node `^22.22.3` or `^24.15.0`.

```sh
cd app
npm ci
npm start            # dev server on http://localhost:5000
```

The app talks to the Voidwell API at `api.<host>` and signs in against `auth.<host>` (see
`app/src/app/core/api/api-routes.ts` and `core/auth/voidwell-auth.service.ts`), so
run it behind a hostname that resolves those subdomains.

## API layer

All HTTP access lives in `app/src/app/core/api/`. Each backend controller has one repository and typed contracts:

```
api/
  api-client.ts      typed HTTP transport (auth header, timeout, caching, 401 handling)
  api-routes.ts      base URLs (`ps2`, `platform`, ...)
  models/            request / response interfaces, one folder per backend
  ps2/               voidwell.clientui controllers (`ps2/*`), e.g. CharacterRepository
  platform/          Voidwell.Platform controllers (`platform/*`), e.g. PostRepository
  auth/              account, user and OIDC administration controllers
```

Daybreak requests go through `Ps2ApiClient`, which adds the `platform` query parameter (`pc`, `ps4us` or `ps4eu`)
from the platform selected in the UI; the three Daybreak instances are routed on it. Reference data that is the same on
every platform opts out with `platform: false`, and the services / store admin lists query all three instances and
tag each item with its platform.

Components inject the repository they need (`inject(CharacterRepository)`) and never build URLs themselves.
When a backend route or DTO changes, update the matching repository and model; `api/repositories.spec.ts`
pins every URL, verb and query string.

## Type safety

`any` is not allowed: ESLint rejects explicit `any` (`@typescript-eslint/no-explicit-any`) and the compiler rejects
implicit `any` (`noImplicitAny`). Type data with the contracts in `api/models/`, or `unknown` plus a type guard when the
shape really is unknown. Templates are type-checked too (`strictTemplates`), so a template that reads a field the
contract does not have fails the build.

## State

Shared state is signals, not subjects: a parent exposes `signal()`s (for example `PlanetsidePlayerComponent.playerData`)
and children read them with `computed()` or `effect()`; services expose loaded reference data as signals built with
`toSignal` (`WorldService.worlds`, `ZoneService.zones`). Route and query parameters arrive as signal inputs (`withComponentInputBinding`), e.g. `readonly id = input<string>()`,
with an `effect` reloading when the URL changes, so components never inject `ActivatedRoute`. `BehaviorSubject` remains only where a CDK table needs a
`DataSource`. NgRx is kept for the two genuinely global slices (auth and the selected platform) and is read with
`store.selectSignal`.

## Scripts

Run from `app/`.

| Script               | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm start`          | Dev server with live reload                   |
| `npm run build:prod` | Production build into `app/dist`              |
| `npm test`           | Run unit tests once                           |
| `npm run lint`       | Lint TypeScript and templates; warnings fail   |
| `npm run serve:prod` | Serve `dist` with the Express server          |

## Docker

```sh
docker build -t voidwell-clientui .
docker run -p 5000:5000 voidwell-clientui
```

The container serves the app on `SERVER_PORT` (default `5000`). Files mounted at
`/app/public` are served under `/files`.

## CI/CD

- **Build & Test** (`.github/workflows/build-test.yml`): lint, unit tests, production build and a Docker build on every PR and push to `main`.
- **Release** (`.github/workflows/release.yml`): pushing a `vX.Y.Z` tag builds and publishes the image to GHCR and creates a GitHub release.
- **CodeQL** and **Dependabot** (npm, Docker, GitHub Actions) run on a schedule.

## License

See [LICENSE](LICENSE).
