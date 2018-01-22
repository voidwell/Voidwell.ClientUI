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
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var BlogPostComponent = (function () {
    function BlogPostComponent(api, route) {
        var _this = this;
        this.api = api;
        this.route = route;
        this.self = this;
        this.errorMessage = null;
        this.routeSub = this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.isLoading = true;
            _this.api.getBlogPost(id)
                .subscribe(function (post) {
                _this.blogPost = post;
                _this.isLoading = false;
            });
        });
    }
    return BlogPostComponent;
}());
BlogPostComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-blog-post',
        templateUrl: './blog-post.template.html',
        styleUrls: ['./../app.styles.css', './blog.styles.css', './blog-post.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, router_1.ActivatedRoute])
], BlogPostComponent);
exports.BlogPostComponent = BlogPostComponent;
