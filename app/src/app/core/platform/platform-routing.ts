import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Ps2Platform } from '@core/api/models/ps2/common.model';
import { PLATFORM_QUERY_PARAM, isPs2Platform, savePlatform } from './platforms';
import { ChangePlatform } from './store/actions/planetside.actions';
import { selectPlanetsideState } from './store/planetside.states';

/**
 * PlanetSide pages that show a single record of one platform (its IDs mean nothing on another), and the list to
 * show instead when the platform changes.
 */
const RECORD_PAGES: readonly [RegExp, string][] = [
    [/^\/ps2\/(player|outfit)\//, '/ps2/news'],
    [/^\/ps2\/alerts\/[^/]+/, '/ps2/alerts'],
    [/^\/ps2\/events\/[^/]+/, '/ps2/events'],
    [/^\/ps2\/worlds\/[^/]+/, '/ps2/worlds']
];

/**
 * Where to go to switch to another platform: the current PlanetSide page on that platform, its list page when the
 * page shows a record of the old platform, or the PlanetSide home from outside the area.
 */
export function platformSwitchUrl(router: Router, platform: Ps2Platform): UrlTree {
    const queryParams = { [PLATFORM_QUERY_PARAM]: platform };
    const path = router.url.split(/[?#]/)[0];

    if (!path.startsWith('/ps2')) {
        return router.createUrlTree(['/ps2'], { queryParams });
    }

    const listPage = RECORD_PAGES.find(([page]) => page.test(path))?.[1];
    if (listPage) {
        return router.createUrlTree([listPage], { queryParams });
    }

    const url = router.parseUrl(router.url);
    url.queryParams = { ...url.queryParams, ...queryParams };
    return url;
}

/**
 * Lets the URL decide the platform of PlanetSide pages, so they can be shared and reloaded: `?platform=` selects
 * it (and is remembered for the next visit), and a URL without it is redirected to name the current platform.
 * Meant to run on every navigation (`runGuardsAndResolvers: 'always'`), so a change of the query parameter alone,
 * such as going back after switching platform, applies too.
 */
export const platformGuard: CanActivateFn = (route, state) => {
    const store = inject(Store);
    const router = inject(Router);
    const current = store.selectSignal(selectPlanetsideState)().platform;
    const requested = route.queryParamMap.get(PLATFORM_QUERY_PARAM);

    if (isPs2Platform(requested)) {
        if (requested !== current) {
            store.dispatch(new ChangePlatform({ platform: requested }));
        }
        savePlatform(requested);
        return true;
    }

    const url = router.parseUrl(state.url);
    url.queryParams = { ...url.queryParams, [PLATFORM_QUERY_PARAM]: current };

    // In-app navigations have not touched the history yet, so the redirect can push as they would have. A page
    // load or back/forward already put the URL without the platform in the history; replace it there.
    const navigation = router.currentNavigation();
    const replaceUrl = !navigation?.previousNavigation || navigation.trigger !== 'imperative' || !!navigation.extras.replaceUrl;
    return new RedirectCommand(url, { replaceUrl, skipLocationChange: navigation?.extras.skipLocationChange });
};
