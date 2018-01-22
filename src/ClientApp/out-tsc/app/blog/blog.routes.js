"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var blog_post_list_component_1 = require("./blog-post-list.component");
var blog_post_component_1 = require("./blog-post.component");
var blogRoutes = [
    {
        path: '',
        component: blog_post_list_component_1.BlogPostListComponent
    },
    {
        path: ':id',
        component: blog_post_component_1.BlogPostComponent
    }
];
exports.routing = router_1.RouterModule.forChild(blogRoutes);
