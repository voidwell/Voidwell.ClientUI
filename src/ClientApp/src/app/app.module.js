"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var store_1 = require("@angular-redux/store");
var animations_1 = require("@angular/platform-browser/animations");
var material_1 = require("@angular/material");
var materialLib_module_1 = require("./shared/materialLib.module");
var voidwell_api_service_1 = require("./shared/services/voidwell-api.service");
var header_service_1 = require("./shared/services/header.service");
var vw_header_component_1 = require("./vw-header/vw-header.component");
var vw_navbar_component_1 = require("./vw-navbar/vw-navbar.component");
var app_routes_1 = require("./app.routes");
var app_component_1 = require("./app.component");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        bootstrap: [app_component_1.AppComponent],
        declarations: [
            app_component_1.AppComponent,
            vw_header_component_1.VWHeaderComponent,
            vw_navbar_component_1.VWNavbarComponent
        ],
        imports: [
            platform_browser_1.BrowserModule,
            materialLib_module_1.MaterialLib,
            animations_1.BrowserAnimationsModule,
            app_routes_1.routing,
            common_1.CommonModule,
            http_1.HttpModule,
            forms_1.FormsModule,
            store_1.NgReduxModule
        ],
        providers: [
            material_1.MatIconRegistry,
            app_routes_1.appRouterProviders,
            voidwell_api_service_1.VoidwellApi,
            header_service_1.HeaderService
        ]
    })
], AppModule);
exports.AppModule = AppModule;
