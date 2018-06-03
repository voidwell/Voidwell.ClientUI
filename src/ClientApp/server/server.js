var express = require('express');
var path = require('path');

var isProduction = process.env.NODE_ENV === 'production';
var port = 5000;

var app = express();

if (isProduction) {
    var distPath = path.resolve(__dirname, './dist');
    var publicPath = path.resolve(__dirname, './public');

    app.use('/files', express.static(publicPath));

    app.use(express.static(distPath));

    app.route('/*').get(function (req, res) {
        return res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(port, function () {
        console.log('Server running on port ' + port);
    });
}