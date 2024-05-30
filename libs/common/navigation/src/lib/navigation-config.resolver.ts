import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, startWith, switchMap } from 'rxjs';
import { NavigationConfigProvider } from './models/navigation-config-provider';
import { NavConfig, NavConfigFn } from './models/navigation-item-config';

@Injectable({ providedIn: 'root' })
export class NavigationConfigResolver {
  private providers: NavConfigFn[] = [];
  private subject$ = new BehaviorSubject<NavConfigFn[]>([]);

  setProviders(navConfigProviders: NavigationConfigProvider[]) {
    if (navConfigProviders && navConfigProviders.length > 0) {
      for (const provider of navConfigProviders) {
        this.providers.push(provider.resolveNavConfig);
      }
      this.subject$.next(this.providers);
    }
  }

  getConfigs(): Observable<NavConfig[]> {
    return this.subject$.pipe(map(provider => provider.map(navConfigFn => navConfigFn()))).pipe(
      switchMap(configs => {
        const configOrEmpty$ = configs.map(config =>
          config.pipe(
            startWith(<NavConfig>[]),
            map(x => x)
          )
        );
        return combineLatest(configOrEmpty$);
      }),
      startWith([])
    );
  }
}
