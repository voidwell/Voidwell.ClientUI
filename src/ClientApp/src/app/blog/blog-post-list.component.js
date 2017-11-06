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
var router_1 = require("@angular/router");
var store_1 = require("@angular-redux/store");
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var BlogPostListComponent = (function () {
    function BlogPostListComponent(api, route, ngRedux) {
        var _this = this;
        this.api = api;
        this.route = route;
        this.ngRedux = ngRedux;
        this.self = this;
        this.errorMessage = null;
        this.searchState = this.ngRedux.select('blogPostList');
        this.stateSub = this.searchState.subscribe(function (blogPosts) {
            if (blogPosts) {
                _this.isLoadingBlogPosts = blogPosts.status === 'loading';
                _this.loadingStatus = blogPosts.status;
            }
            _this.onChange(blogPosts);
        });
    }
    BlogPostListComponent.prototype.ngOnInit = function () {
        this.blogPostListRequest = this.api.getAllBlogPosts();
    };
    BlogPostListComponent.prototype.onChange = function (blogPosts) {
        if (blogPosts && blogPosts.blogPosts) {
            this.blogPosts = blogPosts.blogPosts;
        }
    };
    BlogPostListComponent.prototype.ngOnDestroy = function () {
        if (this.stateSub) {
            this.stateSub.unsubscribe();
        }
        if (this.blogPostListRequest) {
            this.blogPostListRequest.unsubscribe();
        }
    };
    return BlogPostListComponent;
}());
BlogPostListComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-blog-post-list',
        templateUrl: './blog-post-list.template.html',
        styleUrls: ['../app.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, router_1.ActivatedRoute, store_1.NgRedux])
], BlogPostListComponent);
exports.BlogPostListComponent = BlogPostListComponent;
