import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { provideStore } from '@ngrx/store';
import { VoidwellAuthService } from '../../auth/voidwell-auth.service';
import { reducers } from '../../store/app.states';
import { DEADLOCK_API_URL } from '../api-routes';
import { DeadlockQuery, queryParams } from './deadlock-query';
import { DeadlockHeroRepository, DeadlockPatchRepository, DeadlockRankRepository } from './deadlock-reference.repository';
import { HeroAnalyticsRepository } from './hero-analytics.repository';
import { ItemAnalyticsRepository } from './item-analytics.repository';
import { CompositionAnalyticsRepository, CurveAnalyticsRepository, MatchAnalyticsRepository } from './match-analytics.repository';

const deadlock = (path: string) => `${DEADLOCK_API_URL}/${path}`;

describe('queryParams', () => {
    it('sends the day count, mode and rank tiers of a ranked query', () => {
        expect(queryParams({ mode: 'ranked', days: 30, minTier: 4, maxTier: 7 })).toEqual({ days: 30, patch: undefined, mode: 'ranked', minTier: 4, maxTier: 7 });
    });

    it('sends a patch instead of the day count, and no rank tiers outside ranked matches', () => {
        expect(queryParams({ mode: 'unranked', days: 30, patch: 'latest', minTier: 4, maxTier: 7 }))
            .toEqual({ days: undefined, patch: 'latest', mode: 'unranked', minTier: undefined, maxTier: undefined });
    });

    it('adds the parameters of the endpoint', () => {
        expect(queryParams({ mode: 'all', days: 7 }, { minGames: 100 })).toEqual(expect.objectContaining({ minGames: 100, days: 7 }));
    });
});

describe('Voidwell.Deadlock repositories (deadlock/*)', () => {
    let http: HttpTestingController;
    const inject = <T>(token: new () => T): T => TestBed.inject(token);
    const query: DeadlockQuery = { mode: 'ranked', days: 30 };
    const base = 'days=30&mode=ranked';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideStore(reducers),
                { provide: VoidwellAuthService, useValue: { checkSession: (): void => undefined } }
            ]
        });
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    const cases: { name: string; call: () => Observable<unknown>; url: string }[] = [
        { name: 'DeadlockHeroRepository.getHeroes', call: () => inject(DeadlockHeroRepository).getHeroes(), url: deadlock('hero') },
        { name: 'DeadlockHeroRepository.getHero', call: () => inject(DeadlockHeroRepository).getHero(7), url: deadlock('hero/7') },
        { name: 'DeadlockRankRepository.getRanks', call: () => inject(DeadlockRankRepository).getRanks(), url: deadlock('rank') },
        { name: 'DeadlockPatchRepository.getPatches', call: () => inject(DeadlockPatchRepository).getPatches(true), url: deadlock('patch?majorOnly=true') },

        { name: 'HeroAnalyticsRepository.getHeroStats', call: () => inject(HeroAnalyticsRepository).getHeroStats(query), url: deadlock(`analytics/heroes?${base}`) },
        { name: 'HeroAnalyticsRepository.getTierList', call: () => inject(HeroAnalyticsRepository).getTierList(query), url: deadlock(`analytics/heroes/tierlist?${base}&minGames=100`) },
        { name: 'HeroAnalyticsRepository.getTrends', call: () => inject(HeroAnalyticsRepository).getTrends(query), url: deadlock(`analytics/heroes/trends?${base}&minGames=100`) },
        { name: 'HeroAnalyticsRepository.getHero', call: () => inject(HeroAnalyticsRepository).getHero(7, query), url: deadlock(`analytics/heroes/7?${base}`) },
        { name: 'HeroAnalyticsRepository.getItems', call: () => inject(HeroAnalyticsRepository).getItems(7, query, 'spirit', 3), url: deadlock(`analytics/heroes/7/items?${base}&slot=spirit&itemTier=3`) },
        { name: 'HeroAnalyticsRepository.getBuildShapes', call: () => inject(HeroAnalyticsRepository).getBuildShapes(7, query), url: deadlock(`analytics/heroes/7/builds?${base}`) },
        { name: 'HeroAnalyticsRepository.getItemBuild', call: () => inject(HeroAnalyticsRepository).getItemBuild(7, query), url: deadlock(`analytics/heroes/7/item-build?${base}`) },
        { name: 'HeroAnalyticsRepository.getCommunityBuilds', call: () => inject(HeroAnalyticsRepository).getCommunityBuilds(7, query), url: deadlock(`analytics/heroes/7/community-builds?${base}&limit=25`) },
        { name: 'HeroAnalyticsRepository.getAbilityOrder', call: () => inject(HeroAnalyticsRepository).getAbilityOrder(7, query), url: deadlock(`analytics/heroes/7/ability-order?${base}`) },
        { name: 'HeroAnalyticsRepository.getCounters', call: () => inject(HeroAnalyticsRepository).getCounters(7, query), url: deadlock(`analytics/heroes/7/counters?${base}`) },
        { name: 'HeroAnalyticsRepository.getSynergies', call: () => inject(HeroAnalyticsRepository).getSynergies(7, query), url: deadlock(`analytics/heroes/7/synergies?${base}`) },
        { name: 'HeroAnalyticsRepository.getLane', call: () => inject(HeroAnalyticsRepository).getLane(7, query), url: deadlock(`analytics/heroes/7/lane?${base}`) },

        { name: 'ItemAnalyticsRepository.getItemStats', call: () => inject(ItemAnalyticsRepository).getItemStats(query), url: deadlock(`analytics/items?${base}`) },

        { name: 'MatchAnalyticsRepository.getOverview', call: () => inject(MatchAnalyticsRepository).getOverview(query), url: deadlock(`analytics/overview?${base}`) },
        { name: 'MatchAnalyticsRepository.getRanks', call: () => inject(MatchAnalyticsRepository).getRanks(query), url: deadlock(`analytics/ranks?${base}`) },
        { name: 'MatchAnalyticsRepository.getObjectives', call: () => inject(MatchAnalyticsRepository).getObjectives(query), url: deadlock(`analytics/objectives?${base}`) },
        { name: 'MatchAnalyticsRepository.getLeavers', call: () => inject(MatchAnalyticsRepository).getLeavers(query), url: deadlock(`analytics/leavers?${base}`) },
        { name: 'CurveAnalyticsRepository.getHeroCurves', call: () => inject(CurveAnalyticsRepository).getHeroCurves(7, query), url: deadlock(`analytics/heroes/7/curves?${base}`) },
        { name: 'CurveAnalyticsRepository.getSoulsSources', call: () => inject(CurveAnalyticsRepository).getSoulsSources(7, query), url: deadlock(`analytics/heroes/7/souls-sources?${base}`) },
        { name: 'CurveAnalyticsRepository.getLead', call: () => inject(CurveAnalyticsRepository).getLead(query), url: deadlock(`analytics/lead?${base}`) },
        { name: 'CompositionAnalyticsRepository.getCompositions', call: () => inject(CompositionAnalyticsRepository).getCompositions(query), url: deadlock(`analytics/compositions?${base}`) }
    ];

    for (const c of cases) {
        it(c.name, () => {
            c.call().subscribe();
            http.expectOne(r => r.method === 'GET' && r.urlWithParams === c.url).flush(null);
        });
    }

    it('serves every route under deadlock/', () => {
        expect(DEADLOCK_API_URL.endsWith('/deadlock')).toBe(true);
    });
});
