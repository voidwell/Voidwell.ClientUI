const express = require('express');
const path = require('path');

const port = process.env.SERVER_PORT || 5000;

const app = express();

// Optional first argument: directory of the built app (defaults to ./dist next to this file)
const distPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, './dist');
const publicPath = path.resolve(__dirname, './public');

const fallbackPage = path.join(distPath, 'index.html');

app.disable('x-powered-by');

app.use('/files', express.static(publicPath));

app.use(express.static(distPath));

// Single-page app fallback: any other GET serves index.html
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    return res.sendFile(fallbackPage);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
