import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { User } from 'oidc-client';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore, Store } from '@ngrx/store';
import { ApiClient } from './api-client';
import { VoidwellAuthService } from '../auth/voidwell-auth.service';
import { LoadUserSuccess } from '../store/actions/auth.actions';
import { reducers } from '../store/app.states';

describe('ApiClient', () => {
    let api: ApiClient;
    let http: HttpTestingController;
    const authService = { checkSession: vi.fn() };

    beforeEach(() => {
        authService.checkSession.mockReset();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideStore(reducers),
                { provide: VoidwellAuthService, useValue: authService }
            ]
        });
        api = TestBed.inject(ApiClient);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('appends query params and omits null / undefined values', () => {
        api.get('/x', { params: { page: 2, q: 'a b', skip: undefined, none: null } }).subscribe();

        const req = http.expectOne(r => r.url.startsWith('/x'));
        expect(req.request.urlWithParams).toBe('/x?page=2&q=a%20b');
        req.flush({});
    });

    it('does not send an Authorization header for anonymous requests', () => {
        api.get('/x', { auth: true }).subscribe();

        const req = http.expectOne('/x');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('sends the bearer token of the signed-in user when auth is requested', () => {
        TestBed.inject(Store).dispatch(new LoadUserSuccess({ token_type: 'Bearer', access_token: 'abc' } as unknown as User));

        api.get('/secure', { auth: true }).subscribe();
        api.get('/public').subscribe();

        const secure = http.expectOne('/secure');
        expect(secure.request.headers.get('Authorization')).toBe('Bearer abc');
        secure.flush({});

        const open = http.expectOne('/public');
        expect(open.request.headers.has('Authorization')).toBe(false);
        open.flush({});
    });

    it('serves repeated cached GETs from memory', () => {
        const results: unknown[] = [];
        api.get('/cached', { cache: true }).subscribe(r => results.push(r));
        http.expectOne('/cached').flush({ value: 1 });

        api.get('/cached', { cache: true }).subscribe(r => results.push(r));
        http.expectNone('/cached');

        expect(results).toEqual([{ value: 1 }, { value: 1 }]);
    });

    it('does not cache unless asked to', () => {
        api.get('/plain').subscribe();
        http.expectOne('/plain').flush({});

        api.get('/plain').subscribe();
        http.expectOne('/plain').flush({});
    });

    it('checks the session and rethrows on 401', () => {
        let error: HttpErrorResponse | undefined;
        api.get('/secure').subscribe({ error: e => (error = e) });

        http.expectOne('/secure').flush('nope', { status: 401, statusText: 'Unauthorized' });

        expect(authService.checkSession).toHaveBeenCalledTimes(1);
        expect(error?.status).toBe(401);
    });

    it('rethrows other errors without checking the session', () => {
        let error: HttpErrorResponse | undefined;
        api.get('/broken').subscribe({ error: e => (error = e) });

        http.expectOne('/broken').flush('boom', { status: 500, statusText: 'Server Error' });

        expect(authService.checkSession).not.toHaveBeenCalled();
        expect(error?.status).toBe(500);
    });

    it('sends request bodies for POST and PUT', () => {
        api.post('/p', { a: 1 }).subscribe();
        api.put('/p', { b: 2 }).subscribe();

        const [post, put] = http.match('/p');
        expect(post.request.method).toBe('POST');
        expect(post.request.body).toEqual({ a: 1 });
        expect(put.request.method).toBe('PUT');
        expect(put.request.body).toEqual({ b: 2 });
        post.flush({});
        put.flush({});
    });
});
