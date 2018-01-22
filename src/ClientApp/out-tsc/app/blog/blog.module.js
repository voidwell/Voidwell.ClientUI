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
var shared_components_module_1 = require("../shared/components/shared-components.module");
var materialLib_module_1 = require("../shared/materialLib.module");
var blog_post_list_component_1 = require("./blog-post-list.component");
var blog_post_component_1 = require("./blog-post.component");
var blog_routes_1 = require("./blog.routes");
var BlogModule = (function () {
    function BlogModule() {
    }
    return BlogModule;
}());
BlogModule = __decorate([
    core_1.NgModule({
        declarations: [
            blog_post_list_component_1.BlogPostListComponent,
            blog_post_component_1.BlogPostComponent
        ],
        imports: [
            common_1.CommonModule,
            materialLib_module_1.MaterialLib,
            blog_routes_1.routing,
            shared_components_module_1.SharedComponentsModule
        ],
        entryComponents: [blog_post_list_component_1.BlogPostListComponent]
    })
], BlogModule);
exports.BlogModule = BlogModule;
