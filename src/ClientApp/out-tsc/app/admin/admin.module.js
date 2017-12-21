"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var materialLib_module_1 = require("../shared/materialLib.module");
var shared_components_module_1 = require("../shared/components/shared-components.module");
var admin_routes_1 = require("./admin.routes");
var adminwrapper_component_1 = require("./adminwrapper.component");
var dashboard_component_1 = require("./dashboard.component");
var blog_component_1 = require("./blog.component");
var users_component_1 = require("./users.component");
var roles_component_1 = require("./roles.component");
var AdminModule = (function () {
    function AdminModule() {
    }
    return AdminModule;
}());
AdminModule = __decorate([
    core_1.NgModule({
        declarations: [
            adminwrapper_component_1.AdminWrapperComponent,
            dashboard_component_1.DashboardComponent,
            blog_component_1.BlogComponent,
            users_component_1.UsersComponent,
            roles_component_1.RolesComponent
        ],
        imports: [
            forms_1.FormsModule,
            materialLib_module_1.MaterialLib,
            common_1.CommonModule,
            admin_routes_1.routing,
            shared_components_module_1.SharedComponentsModule
        ],
        entryComponents: [adminwrapper_component_1.AdminWrapperComponent]
    })
], AdminModule);
exports.AdminModule = AdminModule;
