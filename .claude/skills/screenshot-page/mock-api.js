#!/usr/bin/env node
// Serves the built app and a fixture-driven fake API on one port, so a page can be opened and screenshotted
// without the real backend.
//
//   node mock-api.js <dist-dir> <fixtures.json> [port]
//
// The app calls `<protocol>//api.<host>/...`, and Chromium resolves `api.localhost` to loopback, so requests whose
// Host starts with `api.` get fixtures and everything else is the static app (falling back to index.html for routes).
//
// fixtures.json is an array of { "match": "<regex on the path>", "body": <json>, "status": 200 }; the first match
// wins and anything unmatched is a 404 with `{}`. Match with anchors, since `/ps2/outfit/1` also matches
// `/ps2/outfit/1/members` without them.
const http = require('http');
const fs = require('fs');
const path = require('path');

const [root, fixturesFile, port = '5055'] = process.argv.slice(2);
if (!root || !fixturesFile) {
    console.error('usage: node mock-api.js <dist-dir> <fixtures.json> [port]');
    process.exit(1);
}

const fixtures = JSON.parse(fs.readFileSync(fixturesFile, 'utf8')).map(f => ({ ...f, match: new RegExp(f.match) }));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');

    if ((req.headers.host || '').startsWith('api.')) {
        const headers = { 'Access-Control-Allow-Origin': req.headers.origin || '*', 'Access-Control-Allow-Headers': '*', 'Content-Type': 'application/json' };
        if (req.method === 'OPTIONS') {
            res.writeHead(204, headers);
            return res.end();
        }
        const fixture = fixtures.find(f => f.match.test(url.pathname));
        res.writeHead(fixture ? fixture.status ?? 200 : 404, headers);
        return res.end(JSON.stringify(fixture ? fixture.body : {}));
    }

    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!path.resolve(file).startsWith(path.resolve(root)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        file = path.join(root, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
}).listen(Number(port), () => console.log(`http://localhost:${port}/`));
