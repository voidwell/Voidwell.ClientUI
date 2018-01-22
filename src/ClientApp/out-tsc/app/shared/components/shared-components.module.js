"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var materialLib_module_1 = require("./../materialLib.module");
var error_message_component_1 = require("./error-message/error-message.component");
var loader_component_1 = require("./loader/loader.component");
var vw_countdown_component_1 = require("./vw-countdown/vw-countdown.component");
var SharedComponentsModule = (function () {
    function SharedComponentsModule() {
    }
    return SharedComponentsModule;
}());
SharedComponentsModule = __decorate([
    core_1.NgModule({
        declarations: [
            error_message_component_1.ErrorMessageComponent,
            loader_component_1.LoaderComponent,
            vw_countdown_component_1.VWCountdownComponent
        ],
        imports: [
            common_1.CommonModule,
            materialLib_module_1.MaterialLib
        ],
        exports: [
            error_message_component_1.ErrorMessageComponent,
            loader_component_1.LoaderComponent,
            vw_countdown_component_1.VWCountdownComponent
        ]
    })
], SharedComponentsModule);
exports.SharedComponentsModule = SharedComponentsModule;
