import { InjectionToken, Provider, Type } from '@angular/core';
import { NavigationConfigProvider } from '../models/navigation-config-provider';

export const NAV_CONFIG_PROVIDERS = new InjectionToken<NavigationConfigProvider[]>('Navigation Config Provider');

export function provideNavConfig(configProvider: Type<NavigationConfigProvider>): Provider[] {
  return [
    {
      provide: NAV_CONFIG_PROVIDERS,
      useClass: configProvider,
      multi: true
    }
  ];
}
