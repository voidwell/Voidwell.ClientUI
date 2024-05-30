import { InjectionToken, Type } from '@angular/core';
import { CanActivateChild } from '@angular/router';

export const CHILD_ROUTES_GUARDS = new InjectionToken<Type<CanActivateChild>[]>('Child Routes Guard');

export function provideChildRoutesGuard(guard: Type<CanActivateChild>) {
  return [
    {
      provide: CHILD_ROUTES_GUARDS,
      useValue: guard,
      multi: true
    }
  ];
}
