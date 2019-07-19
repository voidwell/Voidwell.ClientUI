const express = require('express');
const path = require('path');

const port = process.env.SERVER_PORT || 5000;

const app = express();

const distPath = path.resolve(__dirname, './dist');
const publicPath = path.resolve(__dirname, './public');

const fallbackPage = path.join(distPath, 'index.html');

app.use('/files', express.static(publicPath));

app.use(express.static(distPath));

app.route('/*').get(function(req, res) {
    return res.sendFile(fallbackPage);
});

app.listen(port, function() {
    console.log(`Server running on port ${port}`);
});
