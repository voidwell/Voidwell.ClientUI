import { ApplicationConfig, provideAppInitializer, inject, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAuth } from 'angular-auth-oidc-client';
import { authConfig } from '@core/auth/auth.config';
import { VoidwellAuthService } from '@core/auth/voidwell-auth.service';
import { NavMenuService } from '@core/layout/nav-menu.service';
import { SearchService } from '@core/layout/search.service';
import { reducers } from '@core/store/app.states';
import { AuthEffects, RegistrationEffects } from '@core/store/effects';
import { appRouterProviders, routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptorsFromDi()),
        provideStore(reducers),
        provideEffects(AuthEffects, RegistrationEffects),
        provideAuth(authConfig),
        provideAppInitializer(() => inject(VoidwellAuthService).initialize()),
        appRouterProviders,
        SearchService,
        NavMenuService
    ]
};
