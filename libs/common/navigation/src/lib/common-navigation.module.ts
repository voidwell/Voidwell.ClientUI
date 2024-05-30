import { CommonModule } from '@angular/common';
import { Inject, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { NavigationConfigProvider } from './models/navigation-config-provider';
import { NavConfig } from './models/navigation-item-config';
import { NavigationConfigResolver } from './navigation-config.resolver';
import { NavigationConfigService } from './services/navigation-config.service';
import { NavigationItemsService } from './services/navigation-items.service';
import { NAV_CONFIG_PROVIDERS } from './tokens/nav-config-providers.token';
import { NAV_ITEMS_CONFIGS } from './tokens/nav-item-configs.token';

@NgModule({
  imports: [CommonModule],
  providers: [NavigationConfigService, NavigationItemsService]
})
export class CommonNavigationModule {
  public static forFeature(config: NavConfig): ModuleWithProviders<CommonNavigationModule> {
    return {
      ngModule: CommonNavigationModule,
      providers: [
        {
          provide: NAV_ITEMS_CONFIGS,
          useValue: config,
          multi: true
        }
      ]
    };
  }

  constructor(
    @Optional() @Inject(NAV_CONFIG_PROVIDERS) providers: NavigationConfigProvider[],
    resolver: NavigationConfigResolver
  ) {
    resolver.setProviders(providers);
  }
}
