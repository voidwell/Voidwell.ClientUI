"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AdminWrapperComponent = (function () {
    function AdminWrapperComponent() {
        this.navLinks = [
            { path: 'dashboard', label: 'Dashboard' },
            { path: 'events', label: 'Events' },
            { path: 'blog', label: 'Blog' },
            { path: 'users', label: 'Users' },
            { path: 'roles', label: 'Roles' }
        ];
    }
    return AdminWrapperComponent;
}());
AdminWrapperComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-wrapper',
        templateUrl: './adminwrapper.template.html',
        styleUrls: ['../app.styles.css']
    })
], AdminWrapperComponent);
exports.AdminWrapperComponent = AdminWrapperComponent;
