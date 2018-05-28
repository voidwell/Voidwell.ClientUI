import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { MaterialLib } from '../shared/materialLib.module';
import { BlogPostListComponent } from './blog-post-list/blog-post-list.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { BlogCardComponent } from './blog-card/blog-card.component';
import { routing } from './blog.routes';

@NgModule({
    declarations: [
        BlogPostListComponent,
        BlogPostComponent,
        BlogCardComponent
    ],
    imports: [
        CommonModule,
        MaterialLib,
        routing,
        SharedComponentsModule
    ],
    entryComponents: [BlogPostListComponent]
})
export class BlogModule { }
