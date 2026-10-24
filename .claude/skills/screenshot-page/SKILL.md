---
name: screenshot-page
description: Screenshot a page of the built app, at desktop and phone widths, against fake API data. Use to check a visual change, or to send the user screenshots, without the real backend.
---

# Screenshot a page against fake data

The app only talks to `api.<host>`, which is not reachable from a dev machine, so a page can't load real data. Serve
the built app together with a fixture-driven fake API instead, then screenshot it with headless Edge.

## 1. Build

```
cd app && npm run build:prod
```

The output goes to `app/dist`; serve that, not the dev server.

## 2. Write fixtures

A JSON file outside the repo (the scratchpad) listing the routes the page calls. Find the routes in the repository the
page uses (`app/src/app/core/api/ps2/*.repository.ts`) and the response shapes in `core/api/models/ps2/`. Example:

```json
[
  { "match": "^/ps2/outfit/123/members$", "body": [ { "characterId": "1", "name": "Wakeful", "rankOrdinal": 0, "rank": "Leader", "memberSinceDate": "2020-01-01T00:00:00Z" } ] },
  { "match": "^/ps2/outfit/123$", "body": { "outfitId": "123", "name": "Voidwell Veterans", "factionId": 1, "memberCount": 248, "createdDate": "2013-03-14T00:00:00Z" } }
]
```

Anchor every pattern (`^...$`); `/ps2/outfit/123` also matches `/ps2/outfit/123/members` otherwise. Unmatched routes
return 404 `{}`, which is how to see a page's error state.

Per the design philosophy in AGENTS.md, make the data realistic and include the awkward cases: long names, missing
values, zeros, an empty list, and a missing optional field such as an outfit with no alias.

## 3. Serve

```
node .claude/skills/screenshot-page/mock-api.js app/dist <fixtures.json> 5055
```

Run it in the background. To check a second variant of the data, start another instance on another port with a
different fixtures file. Leave nothing running when you finish: stop the servers by the port they listen on, never
with a blanket kill of every `node` process.

## 4. Screenshot

Headless Edge ships with Windows; open `http://localhost:5055/<route>`:

```
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
W=$(cygpath -m "$PWD")          # Edge needs C:/... paths for the screenshot file, not /c/...
timeout 90 "$E" --headless --disable-gpu --hide-scrollbars --virtual-time-budget=15000 \
  --screenshot="$W/page-desktop.png" --window-size=1280,1250 "http://localhost:5055/ps2/outfit/123"
```

- Desktop is about 1280 wide; the phone check is 500 wide (see the limit below). Set the window height to the page
  height you want; the screenshot is exactly the window.
- `--virtual-time-budget` lets the app load its data before the shot. `timeout` matters: Edge occasionally hangs.
- `--force-device-scale-factor=3` with a small window zooms in on a detail, such as an icon's alignment.
- Headless Edge won't lay out below about 500px wide, so a 390px window gives a cropped page, not a phone view. Treat
  500 as the narrowest check, and say so when the real phone width matters.
- The page loads the app shell too (nav, header); that is expected. The census images (faction emblems) load from
  the internet.

## 5. Look, then send

Read each PNG to check it before sending anything. Send the files the user should see with `SendUserFile`.
