import { Injectable } from '@angular/core';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { combineLatest, map, Observable } from 'rxjs';
import { LinkNavItem, NavigationMap } from '../models/navigation-item';
import { LinkNavItemConfig } from '../models/navigation-item-config';
import { NavigationConfigService } from './navigation-config.service';

@Injectable()
export class NavigationItemsService {
  constructor(private navigationConfigService: NavigationConfigService) {}

  getSideNavigationMap(): Observable<NavigationMap> {
    return combineLatest([
      this.navigationConfigService.sideNavigationConfig,
    ]).pipe(
      map(([topNav]) => {
        const map = <NavigationMap>{
          side: this.mapToLinkNav(topNav)
        };
        return map;
      })
    );
  }

  private mapToLinkNav(config: LinkNavItemConfig[]): LinkNavItem[] {
    return config.map(configItem => ({
      link: configItem.link,
      name: configItem.name,
      icon: configItem.icon || '',
      subItems: configItem.subItems ? this.mapToLinkNav(configItem.subItems) : undefined,
      enabled: isNull(configItem.enabled) || isUndefined(configItem.enabled) ? true : configItem.enabled,
      exact: isNull(configItem.exact) || isUndefined(configItem.exact) ? true : configItem.exact
    }));
  }
}
