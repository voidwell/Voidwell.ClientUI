"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var app_reducers_1 = require("./app.reducers");
var store_1 = require("@angular-redux/store");
var material_1 = require("@angular/material");
;
var AppComponent = (function () {
    function AppComponent(ngRedux, iconRegistry, viewContainer) {
        this.ngRedux = ngRedux;
        this.iconRegistry = iconRegistry;
        this.viewContainer = viewContainer;
        this.iconRegistry.setDefaultFontSetClass('mdi');
        ngRedux.configureStore(app_reducers_1.default, {
            loggedInUser: null,
            blogPost: null,
            blogPostList: null,
            registration: null
        }, null, []);
    }
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'app',
        templateUrl: './app.template.html',
        styleUrls: ['./app-import.styles.css', './app.styles.css', './planetside.styles.css'],
        encapsulation: core_1.ViewEncapsulation.None
    }),
    __metadata("design:paramtypes", [store_1.NgRedux,
        material_1.MatIconRegistry,
        core_1.ViewContainerRef])
], AppComponent);
exports.AppComponent = AppComponent;
