var express = require('express');
var path = require('path');
var helmet = require('helmet')

var isProduction = process.env.NODE_ENV === 'production';
var publicPath = path.resolve(__dirname, './dist');
var port = 5000;

if (isProduction) {
    var app = express();

    app.use(helmet());

    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self' 'unsafe-inline'"],
            imgSrc: ["'self'"],
            scriptSrc: ["'self' 'unsafe-inline' 'unsafe-eval'"]
        }
    }));

    app.use(express.static(publicPath));

    app.route('/*').get(function (req, res) {
        return res.sendFile(path.join(publicPath, 'index.html'));
    });

    app.listen(port, function () {
        console.log('Server running on port ' + port);
    });
}