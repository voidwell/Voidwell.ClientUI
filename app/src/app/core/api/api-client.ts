import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { RequestCache } from './request-cache.service';
import { VoidwellAuthService } from '../auth/voidwell-auth.service';
import { AppState, selectAuthState } from '../store/app.states';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
    /** Query string values. Null and undefined values are omitted. */
    params?: QueryParams;
    /** Send the signed-in user's bearer token. */
    auth?: boolean;
    /** Serve repeat GETs from the in-memory cache. */
    cache?: boolean;
}

const REQUEST_TIMEOUT_MS = 60000;

/**
 * Typed HTTP transport shared by all repositories. It owns auth headers,
 * timeouts, caching and 401 handling so repositories only describe contracts.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
    private http = inject(HttpClient);
    private cache = inject(RequestCache);
    private authService = inject(VoidwellAuthService);
    private snackBar = inject(MatSnackBar);
    private authState = inject<Store<AppState>>(Store).selectSignal(selectAuthState);

    get<T>(url: string, options: RequestOptions = {}): Observable<T> {
        const fullUrl = this.buildUrl(url, options.params);
        return this.send(fullUrl, () => this.http.get<T>(fullUrl, this.httpOptions(options)), options.cache, true);
    }

    post<TResponse = void, TBody = unknown>(url: string, body: TBody | null, options: RequestOptions = {}): Observable<TResponse> {
        const fullUrl = this.buildUrl(url, options.params);
        return this.send(fullUrl, () => this.http.post<TResponse>(fullUrl, body, this.httpOptions(options)));
    }

    put<TResponse = void, TBody = unknown>(url: string, body: TBody, options: RequestOptions = {}): Observable<TResponse> {
        const fullUrl = this.buildUrl(url, options.params);
        return this.send(fullUrl, () => this.http.put<TResponse>(fullUrl, body, this.httpOptions(options)));
    }

    delete<T = void>(url: string, options: RequestOptions = {}): Observable<T> {
        const fullUrl = this.buildUrl(url, options.params);
        return this.send(fullUrl, () => this.http.delete<T>(fullUrl, this.httpOptions(options)));
    }

    private send<T>(cacheKey: string, request: () => Observable<T>, isCached = false, notifyOnError = false): Observable<T> {
        if (isCached) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return of(cached as T);
            }
        }

        let response = request().pipe(
            timeout(REQUEST_TIMEOUT_MS),
            catchError(error => {
                if (error.status === 401) {
                    this.authService.checkSession();
                } else if (notifyOnError) {
                    this.notifyLoadFailed(error);
                }
                return throwError(() => error);
            }));

        if (isCached) {
            response = response.pipe(tap(body => this.cache.put(cacheKey, body)));
        }

        return response;
    }

    /** Toasts a failed load. A 401 is skipped because the session check signs the user in again. */
    private notifyLoadFailed(error: { status?: number }): void {
        const message = error.status === 0
            ? 'Unable to reach the server. Check your connection and try again.'
            : 'Something went wrong while loading data. Please try again.';
        this.snackBar.open(message, 'Dismiss', { duration: 6000 });
    }

    private httpOptions(options: RequestOptions): { headers?: HttpHeaders } {
        const state = this.authState();
        if (!options.auth || !state?.isAuthenticated || !state.user) {
            return {};
        }

        return {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${state.user.accessToken}`)
                .set('Content-Type', 'application/json')
        };
    }

    private buildUrl(url: string, params?: QueryParams): string {
        if (!params) {
            return url;
        }

        let httpParams = new HttpParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                httpParams = httpParams.set(key, String(value));
            }
        }

        const query = httpParams.toString();
        return query ? `${url}?${query}` : url;
    }
}
