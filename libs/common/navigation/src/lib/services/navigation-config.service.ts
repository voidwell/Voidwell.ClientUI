import { Inject, Injectable, Optional } from '@angular/core';
import { combineLatest, map, Observable, of } from 'rxjs';
import { LinkNavItemConfig, NavConfig, Orderable } from '../models/navigation-item-config';
import { NavigationConfigResolver } from '../navigation-config.resolver';
import { NAV_ITEMS_CONFIGS } from '../tokens/nav-item-configs.token';

@Injectable()
export class NavigationConfigService {
  private sideConfig$: Observable<LinkNavItemConfig[]>;

  constructor(
    configResolver: NavigationConfigResolver,
    @Optional() @Inject(NAV_ITEMS_CONFIGS) staticNavConfigs: NavConfig[],
  ) {
    const configs$ = this.concatConfigs(configResolver.getConfigs(), of(staticNavConfigs ?? []));
    const sideConfigsArray$ = configs$.pipe(map(x => x.map(config => config.side ?? [])));

    this.sideConfig$ = this.getSortedItems(this.mergeConfig(sideConfigsArray$));
  }

  public get sideNavigationConfig() {
    return this.sideConfig$;
  }

  private concatConfigs(...configs: Observable<NavConfig[]>[]): Observable<NavConfig[]> {
    return combineLatest(configs).pipe(map(cfg => cfg.reduce<NavConfig[]>((result, item) => result.concat(item), [])));
  }

  private mergeConfig<TConfig extends { link: string, subItems?: unknown[] }>(
    items: Observable<Array<TConfig>[]>
  ): Observable<TConfig[]> {
    // groupBy item.link
    return items.pipe(
      map(x => {
        return x.reduce((dict, items) => {
          items.forEach(item => {
            const currSubItems = dict[item.link] && dict[item.link].subItems;
            dict[item.link] = {
              ...dict[item.link],
              ...item,
              subItems: currSubItems ? currSubItems.concat(item.subItems || []) : item.subItems
            };
          });
          return dict;
        }, <{ [TKey: string]: TConfig }>{});
      }),
      map(dict => Object.values(dict))
    );
  }

  private getSortedItems<TConfig extends Orderable & { subItems?: Orderable[] }>(items: Observable<TConfig[]>) {
    return items.pipe(
      map(item => {
        // sort top level items
        const sortedItems = item.slice().sort(this.sortByOrder);
        // sort subItems
        sortedItems.forEach(i => i.subItems && i.subItems.sort(this.sortByOrder));
        return sortedItems;
      })
    );
  }

  private sortByOrder(a: Orderable, b: Orderable) {
    return (a.order || 0) - (b.order || 0);
  }
}
