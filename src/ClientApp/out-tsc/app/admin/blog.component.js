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
var BlogComponent = (function () {
    function BlogComponent(api) {
        this.api = api;
    }
    BlogComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.getBlogPostsRequest = this.api.getAllBlogPosts()
            .subscribe(function (blogPosts) {
            _this.blogPosts = blogPosts;
            _this.isLoading = false;
        });
    };
    BlogComponent.prototype.onCreateBlogPost = function (blogPostForm) {
        var _this = this;
        if (blogPostForm.valid) {
            var blogPost = blogPostForm.value;
            this.isLoading = true;
            this.api.createBlogPost(blogPost)
                .subscribe(function (result) {
                blogPostForm.reset();
                _this.isCreating = false;
                _this.isLoading = false;
            });
        }
    };
    BlogComponent.prototype.onUpdateBlogPost = function (blogPostForm) {
        var _this = this;
        if (blogPostForm.valid) {
            var blogPost = blogPostForm.value;
            this.isLoading = true;
            this.api.updateBlogPost(blogPost)
                .subscribe(function (result) {
                _this.isLoading = false;
            });
        }
    };
    BlogComponent.prototype.onDeleteBlogPost = function (blogPostId) {
        var _this = this;
        this.isLoading = true;
        this.api.deleteBlogPost(blogPostId)
            .subscribe(function (result) {
            _this.isLoading = false;
        });
    };
    return BlogComponent;
}());
BlogComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-blog',
        templateUrl: './blog.template.html',
        styleUrls: ['../app.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], BlogComponent);
exports.BlogComponent = BlogComponent;
