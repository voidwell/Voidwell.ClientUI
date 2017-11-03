import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { BlogPostListComponent } from './blog-post-list.component';
import { BlogPostComponent } from './blog-post.component';

const blogRoutes: Routes = [
    {
        path: '',
        component: BlogPostListComponent
    },
    {
        path: ':id',
        component: BlogPostComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(blogRoutes);