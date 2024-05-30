import { InjectionToken, Provider } from '@angular/core';
import { Routes } from '@angular/router';

export const ANONYMOUS_ROUTES = new InjectionToken<Routes[]>('Anonymous Routes');

export function provideAnonymousRoutes(routes?: Routes): Provider[] {
  return routes
    ? [
        {
          provide: ANONYMOUS_ROUTES,
          useValue: routes,
          multi: true
        }
      ]
    : [];
}
