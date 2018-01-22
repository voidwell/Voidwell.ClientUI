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
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var BlogPostListComponent = (function () {
    function BlogPostListComponent(api) {
        this.api = api;
        this.self = this;
        this.errorMessage = null;
    }
    BlogPostListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.api.getAllBlogPosts()
            .subscribe(function (blogPosts) {
            _this.blogPosts = blogPosts;
            _this.isLoading = false;
        });
    };
    return BlogPostListComponent;
}());
BlogPostListComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-blog-post-list',
        templateUrl: './blog-post-list.template.html',
        styleUrls: ['./../app.styles.css', './blog.styles.css', './blog-post-list.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], BlogPostListComponent);
exports.BlogPostListComponent = BlogPostListComponent;
