"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var dgc_image_url_pipe_1 = require("./dgc-image-url.pipe");
var faction_color_pipe_1 = require("./faction-color.pipe");
var faction_name_pipe_1 = require("./faction-name.pipe");
var faction_code_pipe_1 = require("./faction-code.pipe");
var zone_name_pipe_1 = require("./zone-name.pipe");
var world_name_pipe_1 = require("./world-name.pipe");
var faction_background_pipe_1 = require("./faction-background.pipe");
var PIPES = [
    dgc_image_url_pipe_1.DgcImageUrlPipe, faction_color_pipe_1.FactionColorPipe, faction_name_pipe_1.FactionNamePipe, faction_code_pipe_1.FactionCodePipe, zone_name_pipe_1.ZoneNamePipe, world_name_pipe_1.WorldNamePipe, faction_background_pipe_1.FactionBackgroundPipe
];
var PlanetsidePipesModule = (function () {
    function PlanetsidePipesModule() {
    }
    return PlanetsidePipesModule;
}());
PlanetsidePipesModule = __decorate([
    core_1.NgModule({
        declarations: PIPES,
        imports: [],
        exports: PIPES
    })
], PlanetsidePipesModule);
exports.PlanetsidePipesModule = PlanetsidePipesModule;
var dgc_image_url_pipe_2 = require("./dgc-image-url.pipe");
exports.DgcImageUrlPipe = dgc_image_url_pipe_2.DgcImageUrlPipe;
var faction_color_pipe_2 = require("./faction-color.pipe");
exports.FactionColorPipe = faction_color_pipe_2.FactionColorPipe;
var faction_name_pipe_2 = require("./faction-name.pipe");
exports.FactionNamePipe = faction_name_pipe_2.FactionNamePipe;
var faction_code_pipe_2 = require("./faction-code.pipe");
exports.FactionCodePipe = faction_code_pipe_2.FactionCodePipe;
var zone_name_pipe_2 = require("./zone-name.pipe");
exports.ZoneNamePipe = zone_name_pipe_2.ZoneNamePipe;
var world_name_pipe_2 = require("./world-name.pipe");
exports.WorldNamePipe = world_name_pipe_2.WorldNamePipe;
var faction_background_pipe_2 = require("./faction-background.pipe");
exports.FactionBackgroundPipe = faction_background_pipe_2.FactionBackgroundPipe;
