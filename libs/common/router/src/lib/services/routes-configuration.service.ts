import { Inject, Injectable, Optional, Type } from '@angular/core';
import { CanActivate, CanActivateChild, Router, Routes } from '@angular/router';
import flatten from 'lodash/flatten';
import { ANONYMOUS_ROUTES } from '../configuration/anonymous.route';
import { AUTH_GUARDS } from '../configuration/auth.guard';
import { AUTHORIZED_ROUTES } from '../configuration/authorized.route';
import { CHILD_ROUTES_GUARDS } from '../configuration/child-routes.guard';
import { ROOT_GUARDS } from '../configuration/root.guard';

export function routesFactory(routesConfig: RoutesConfigurationService) {
  return () => {
    routesConfig.initialize();
  };
}

@Injectable()
export class RoutesConfigurationService {
  constructor(
    private router: Router,
    @Optional() @Inject(AUTHORIZED_ROUTES) private authorizedRoutes: Routes[],
    @Optional() @Inject(ANONYMOUS_ROUTES) private anonymousRoutes: Routes[],
    @Optional() @Inject(ROOT_GUARDS) private rootGuards: Type<CanActivate>[],
    @Optional() @Inject(CHILD_ROUTES_GUARDS) private childRoutesGuards: Type<CanActivateChild>[],
    @Optional() @Inject(AUTH_GUARDS) private authGuards: Type<CanActivate>[]
  ) {}

  initialize() {
    this.router.resetConfig([
      {
        path: '',
        canActivate: this.rootGuards,
        canActivateChild: this.childRoutesGuards,
        data: { navigation: true }, // show/hide top-nav on anonymous navigation page
        children: [
          ...flatten(this.anonymousRoutes),
          {
            path: '',
            data: { authorized: true },
            canActivate: this.authGuards,
            children: [...flatten(this.authorizedRoutes)]
          }
        ]
      }
    ]);
  }
}
