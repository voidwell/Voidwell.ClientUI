import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BlogLazyModule } from '@voidwell/blog/lazy';
import { CommonHttpModule } from '@voidwell/common/http';
import { CommonRouterModule } from '@voidwell/common/router';
import { HeaderModule } from '@voidwell/header';
import { NavigationModule } from '@voidwell/navigation';
import { Planetside2HubLazyModule } from '@voidwell/planetside2/hub/lazy'
import { AppComponent } from './app.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonHttpModule,
    StoreModule.forRoot(
      {},
      {
        metaReducers: [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true
        }
      }
    ),
    EffectsModule.forRoot([]),
    CommonRouterModule.forRoot({ anonymous: routes }),
    BrowserModule,
    HeaderModule,
    NavigationModule,
    BlogLazyModule,
    Planetside2HubLazyModule
  ],
  exports: [AppComponent],
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
      deps: [PlatformLocation]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
