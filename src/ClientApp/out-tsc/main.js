"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
window['$'] = window['jQuery'] = window['jquery'] = $;
require("reflect-metadata");
require("bootstrap");
var core_1 = require("@angular/core");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app/app.module");
var hmr_1 = require("./hmr");
var bootstrap = function () { return platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule); };
if (module.hot) {
    hmr_1.hmrBootstrap(module, bootstrap);
}
else {
    core_1.enableProdMode();
    bootstrap();
}
