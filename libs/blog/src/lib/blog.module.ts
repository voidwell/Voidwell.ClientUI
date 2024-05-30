import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonRouterModule, Route } from '@voidwell/common/router';
import { BlogComponent } from './blog.component';
import { BlogRepository } from './blog.repository';
import { EffectsModule } from '@ngrx/effects';
import { BlogEffects } from './+state/effects';
import { StoreModule } from '@ngrx/store';
import { BLOG_FEATURE_KEY } from './constants';
import { reducer } from './+state/reducer';
import { BlogPostComponent } from './components/blog-post/blog-post.component';
import { SpinnerModule } from '@voidwell/common/components';
import { MatCardModule } from '@angular/material/card';

export const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: BlogComponent
  },
  {
    path: ':blogPostId',
    component: BlogComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    CommonRouterModule.forFeature({ lazy: routes }),
    EffectsModule.forFeature(BlogEffects),
    StoreModule.forFeature(BLOG_FEATURE_KEY, reducer),
    SpinnerModule,
    MatCardModule
  ],
  declarations: [
    BlogComponent,
    BlogPostComponent
  ],
  providers:[BlogRepository]
})
export class BlogModule {}
