import { InjectionToken, Provider } from '@angular/core';
import { Routes } from '@angular/router';

export const AUTHORIZED_ROUTES = new InjectionToken<Routes[]>('Authorized Routes');

export function provideAuthorizedRoutes(routes?: Routes): Provider[] {
  return routes
    ? [
        {
          provide: AUTHORIZED_ROUTES,
          useValue: routes,
          multi: true
        }
      ]
    : [];
}
