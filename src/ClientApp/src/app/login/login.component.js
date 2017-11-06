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
var LoginComponent = (function () {
    function LoginComponent(api, route, ngRedux) {
        var _this = this;
        this.api = api;
        this.route = route;
        this.ngRedux = ngRedux;
        this.self = this;
        this.errorMessage = null;
        this.routeSub = this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.blogPostRequest = _this.api.getBlogPost(id);
        });
        this.searchState = this.ngRedux.select('blogPost');
        this.stateSub = this.searchState.subscribe(function (blogPost) {
            if (blogPost) {
                _this.isLoadingBlogPost = blogPost.status === 'loading';
                _this.loadingStatus = blogPost.status;
            }
            _this.onChange(blogPost);
        });
    }
    LoginComponent.prototype.onChange = function (blogPost) {
        this.blogPost = blogPost;
    };
    LoginComponent.prototype.ngOnDestroy = function () {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
        if (this.stateSub) {
            this.stateSub.unsubscribe();
        }
        if (this.blogPostRequest) {
            this.blogPostRequest.unsubscribe();
        }
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-login',
        templateUrl: './login.template.html',
        styleUrls: ['../app.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, router_1.ActivatedRoute, store_1.NgRedux])
], LoginComponent);
exports.LoginComponent = LoginComponent;
