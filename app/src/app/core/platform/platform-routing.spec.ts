import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, Router, RouterStateSnapshot, convertToParamMap, provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngrx/store';
import { reducers } from '@core/store/app.states';
import { Ps2Platform } from '@core/api/models/ps2/common.model';
import { loadSavedPlatform } from './platforms';
import { platformGuard, platformSwitchUrl } from './platform-routing';
import { ChangePlatform } from './store/actions/planetside.actions';
import { selectPlanetsideState } from './store/planetside.states';

describe('platform routing', () => {
    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [provideRouter([]), provideStore(reducers)]
        });
    });

    afterEach(() => localStorage.clear());

    describe('platformSwitchUrl', () => {
        const switchFrom = (url: string, platform: Ps2Platform) => {
            const router = TestBed.inject(Router);
            vi.spyOn(router, 'url', 'get').mockReturnValue(url);
            return router.serializeUrl(platformSwitchUrl(router, platform));
        };

        it('stays on a list page and keeps its other query parameters', () => {
            expect(switchFrom('/ps2/oracle?platform=pc&stat=kills', 'ps4us')).toBe('/ps2/oracle?platform=ps4us&stat=kills');
        });

        it('goes to the list page from a record of the old platform', () => {
            expect(switchFrom('/ps2/player/123/weapons?platform=pc', 'ps4eu')).toBe('/ps2/news?platform=ps4eu');
            expect(switchFrom('/ps2/outfit/9?platform=pc', 'ps4eu')).toBe('/ps2/news?platform=ps4eu');
            expect(switchFrom('/ps2/alerts/17/1234/players?platform=pc', 'ps4us')).toBe('/ps2/alerts?platform=ps4us');
            expect(switchFrom('/ps2/events/42?platform=pc', 'ps4us')).toBe('/ps2/events?platform=ps4us');
            expect(switchFrom('/ps2/worlds/17/map/2?platform=pc', 'ps4us')).toBe('/ps2/worlds?platform=ps4us');
        });

        it('keeps pages whose records are shared by every platform', () => {
            expect(switchFrom('/ps2/item/80/stats?platform=pc', 'ps4us')).toBe('/ps2/item/80/stats?platform=ps4us');
        });

        it('opens the PlanetSide area from outside it', () => {
            expect(switchFrom('/blog', 'ps4us')).toBe('/ps2?platform=ps4us');
        });
    });

    describe('platformGuard', () => {
        const run = (url: string) => {
            const query = new URL(url, 'http://host').searchParams;
            const route = { queryParamMap: convertToParamMap(Object.fromEntries(query)) } as ActivatedRouteSnapshot;
            return TestBed.runInInjectionContext(() => platformGuard(route, { url } as RouterStateSnapshot));
        };
        const selected = () => TestBed.inject(Store).selectSignal(selectPlanetsideState)().platform;

        it('selects and remembers the platform the URL names', () => {
            expect(run('/ps2/alerts?platform=ps4eu')).toBe(true);

            expect(selected()).toBe('ps4eu');
            expect(loadSavedPlatform()).toBe('ps4eu');
        });

        it('redirects a URL without a platform to the selected one', () => {
            TestBed.inject(Store).dispatch(new ChangePlatform({ platform: 'ps4us' }));

            const result = run('/ps2/alerts?page=2');

            expect(result).toBeInstanceOf(RedirectCommand);
            const redirect = result as RedirectCommand;
            expect(TestBed.inject(Router).serializeUrl(redirect.redirectTo)).toBe('/ps2/alerts?page=2&platform=ps4us');
            expect(redirect.navigationBehaviorOptions?.replaceUrl).toBe(true);
        });

        it('treats an unknown platform like a missing one', () => {
            const result = run('/ps2/alerts?platform=xbox') as RedirectCommand;

            expect(TestBed.inject(Router).serializeUrl(result.redirectTo)).toBe('/ps2/alerts?platform=pc');
            expect(selected()).toBe('pc');
        });
    });
});
