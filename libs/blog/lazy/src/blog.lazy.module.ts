import { NgModule } from '@angular/core';
import { CommonNavigationModule } from '@voidwell/common/navigation';
import { CommonRouterModule } from '@voidwell/common/router';

export const loadModule = () => import('@voidwell/blog').then(m => m.BlogModule);

// @dynamic
@NgModule({
  imports: [
    CommonRouterModule.forFeature({
      anonymous: [
        {
          path: 'blog',
          loadChildren: loadModule
        }
      ]
    }),
    CommonNavigationModule.forFeature({
      side: [
        {
          order: 1,
          link: 'blog',
          name: 'Blog',
          icon: 'mdi-message-text',
          exact: false
        }
      ]
    })
  ]
})
export class BlogLazyModule {}
