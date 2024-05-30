import { NgModule } from '@angular/core';
import { CommonNavigationModule } from '@voidwell/common/navigation';
import { CommonRouterModule } from '@voidwell/common/router';

export const loadModule = () => import('@voidwell/planetside2/hub').then(m => m.HubModule);

// @dynamic
@NgModule({
  imports: [
    CommonRouterModule.forFeature({
      anonymous: [
        {
          path: 'ps2',
          loadChildren: loadModule
        }
      ]
    }),
    CommonNavigationModule.forFeature({
      side: [
        {
          order: 1,
          link: 'ps2',
          name: 'Planetside 2',
          icon: 'mdi-gamepad-variant',
          exact: false,
          subItems: [
            {
              link: 'ps2/news',
              name: 'News'
            }
          ]
        }
      ]
    })
  ]
})
export class Planetside2HubLazyModule {}
