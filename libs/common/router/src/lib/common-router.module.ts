import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { provideRoutes, RouterModule } from '@angular/router';
import { NavigationActionTiming, routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { ROUTER_FEATURE_KEY } from './+state/router.state';
import { provideAnonymousRoutes } from './configuration/anonymous.route';
import { provideAuthorizedRoutes } from './configuration/authorized.route';
import { EagerRoutesConfig, isLazyRoutesConfig, LazyRoutesConfig, RoutesConfig } from './configuration/route.config';
import { CommonRouteSerializer } from './services/route-serializer.service';
import { RoutesConfigurationService, routesFactory } from './services/routes-configuration.service';

export function provideEagerRoutes(config: EagerRoutesConfig): Provider[] {
  return [...provideAuthorizedRoutes(config.authorized), ...provideAnonymousRoutes(config.anonymous)];
}

export function provideLazyRoutes(config: LazyRoutesConfig) {
  return provideRoutes([{ path: '', children: config.lazy }]);
}

@NgModule({
  imports: [
    RouterModule.forRoot([], {
      initialNavigation: 'enabledNonBlocking',
      enableTracing: false
    }),
    StoreModule.forFeature(ROUTER_FEATURE_KEY, routerReducer),
    StoreRouterConnectingModule.forRoot({
      serializer: CommonRouteSerializer,
      navigationActionTiming: NavigationActionTiming.PostActivation
    })
  ],
  exports: [RouterModule]
})
export class RootRouterStateModule {}

@NgModule({
  imports: [RouterModule],
  exports: [RouterModule]
})
export class CommonRouterModule {
  public static forRoot(config: EagerRoutesConfig): ModuleWithProviders<RootRouterStateModule> {
    return {
      ngModule: RootRouterStateModule,
      providers: [
        RoutesConfigurationService,
        provideEagerRoutes(config),
        {
          provide: APP_INITIALIZER,
          useFactory: routesFactory,
          deps: [RoutesConfigurationService],
          multi: true
        }
      ]
    };
  }

  public static forFeature(config: RoutesConfig): ModuleWithProviders<CommonRouterModule> {
    return {
      ngModule: CommonRouterModule,
      providers: isLazyRoutesConfig(config) ? provideLazyRoutes(config) : provideEagerRoutes(config)
    };
  }
}
