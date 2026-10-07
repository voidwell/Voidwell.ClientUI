import { Routes } from '@angular/router';
import { BlogPostListComponent } from './blog-post-list/blog-post-list.component';
import { BlogPostComponent } from './blog-post/blog-post.component';

export const BLOG_ROUTES: Routes = [
    {
        path: '',
        component: BlogPostListComponent
    },
    {
        path: ':id',
        component: BlogPostComponent
    }
];
