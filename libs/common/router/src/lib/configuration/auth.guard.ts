import { InjectionToken, Provider, Type } from '@angular/core';
import { CanActivate } from '@angular/router';

export const AUTH_GUARDS = new InjectionToken<Type<CanActivate>[]>('Auth Guard');

export function provideAuthGuard(guard: Type<CanActivate>): Provider[] {
  return [
    {
      provide: AUTH_GUARDS,
      useValue: guard,
      multi: true
    }
  ];
}
