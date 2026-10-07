import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
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
        appRouterProviders,
        SearchService,
        NavMenuService
    ]
};
