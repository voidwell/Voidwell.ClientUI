import { InjectionToken, Provider, Type } from '@angular/core';
import { CanActivate } from '@angular/router';

export const ROOT_GUARDS = new InjectionToken<Type<CanActivate>[]>('Root Guard');

export function provideRootGuard(guard: Type<CanActivate>): Provider[] {
  return [
    {
      provide: ROOT_GUARDS,
      useValue: guard,
      multi: true
    }
  ];
}
