import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPostListComponent } from './blog-post-list.component';
import { BlogPostComponent } from './blog-post.component';
import { routing } from './blog.routes';

@NgModule({
    imports: [
        CommonModule,
        routing
    ],
    declarations: [
        BlogPostListComponent,
        BlogPostComponent
    ],
    entryComponents: [BlogPostListComponent]
})
export class BlogModule { }
