import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonRouterModule, Route } from '@voidwell/common/router';
import { NewsComponent } from './news.component';
import { NewsRepository } from './news.repository';
import { EffectsModule } from '@ngrx/effects';
import { NewsEffects } from './+state/effects';
import { StoreModule } from '@ngrx/store';
import { PS2_NEWS_FEATURE_KEY } from './constants';
import { reducer } from './+state/reducer';
import { NewsPostComponent } from './components/news-post/news-post.component';
import { SpinnerModule } from '@voidwell/common/components';
import { MatCardModule } from '@angular/material/card';

export const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: NewsComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    CommonRouterModule.forFeature({ lazy: routes }),
    EffectsModule.forFeature(NewsEffects),
    StoreModule.forFeature(PS2_NEWS_FEATURE_KEY, reducer),
    SpinnerModule,
    MatCardModule
  ],
  declarations: [
    NewsComponent,
    NewsPostComponent
  ],
  providers:[NewsRepository]
})
export class NewsModule {}
