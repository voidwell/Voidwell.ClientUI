"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AvgPipe = (function () {
    function AvgPipe() {
    }
    AvgPipe.prototype.transform = function (arr) {
        if (!Array.isArray(arr)) {
            return arr;
        }
        var total = arr.reduce(function (sum, curr) { return sum + curr; }, 0);
        return total / arr.length;
    };
    return AvgPipe;
}());
AvgPipe = __decorate([
    core_1.Pipe({ name: 'avg' })
], AvgPipe);
exports.AvgPipe = AvgPipe;
