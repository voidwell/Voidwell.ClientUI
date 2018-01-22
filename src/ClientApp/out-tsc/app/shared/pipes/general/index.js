"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var math_average_pipe_1 = require("./math-average.pipe");
var math_median_pipe_1 = require("./math-median.pipe");
var PIPES = [
    math_average_pipe_1.AvgPipe, math_median_pipe_1.MedianPipe
];
var GeneralPipesModule = (function () {
    function GeneralPipesModule() {
    }
    return GeneralPipesModule;
}());
GeneralPipesModule = __decorate([
    core_1.NgModule({
        declarations: PIPES,
        imports: [],
        exports: PIPES
    })
], GeneralPipesModule);
exports.GeneralPipesModule = GeneralPipesModule;
var math_average_pipe_2 = require("./math-average.pipe");
exports.AvgPipe = math_average_pipe_2.AvgPipe;
var math_median_pipe_2 = require("./math-median.pipe");
exports.MedianPipe = math_median_pipe_2.MedianPipe;
