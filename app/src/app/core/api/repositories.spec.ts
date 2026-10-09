import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { Store, provideStore } from '@ngrx/store';
import { PLATFORM_API_URL, PS2_API_URL } from './api-routes';
import { VoidwellAuthService } from '../auth/voidwell-auth.service';
import { reducers } from '../store/app.states';
import { PlatformServiceState, PlatformStoreUpdate } from './models/ps2/admin.model';
import { CustomEventRepository } from './platform/custom-event.repository';
import { PostRepository } from './platform/post.repository';
import { UtilsRepository } from './platform/utils.repository';
import { AlertRepository } from './ps2/alert.repository';
import { CharacterRepository } from './ps2/character.repository';
import { CombatReportRepository } from './ps2/combat-report.repository';
import { FeedsRepository } from './ps2/feeds.repository';
import { GradesRepository } from './ps2/grades.repository';
import { LeaderboardRepository } from './ps2/leaderboard.repository';
import { MapRepository } from './ps2/map.repository';
import { OracleRepository } from './ps2/oracle.repository';
import { OutfitRepository } from './ps2/outfit.repository';
import { ProfileRepository } from './ps2/profile.repository';
import { PsbUtilityRepository } from './ps2/psb-utility.repository';
import { RankingsRepository } from './ps2/rankings.repository';
import { SearchRepository } from './ps2/search.repository';
import { ServicesRepository } from './ps2/services.repository';
import { StoreRepository } from './ps2/store.repository';
import { VehicleRepository } from './ps2/vehicle.repository';
import { WeaponInfoRepository } from './ps2/weapon-info.repository';
import { WorldStateRepository } from './ps2/world-state.repository';
import { WorldRepository } from './ps2/world.repository';
import { ZoneRepository } from './ps2/zone.repository';

type Case = {
    name: string;
    call: () => Observable<unknown>;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /** Expected URL including query string. */
    url: string;
    body?: unknown;
};

/** Daybreak URL as sent for the default (pc) platform. */
const ps2 = (path: string) => `${PS2_API_URL}/${path}${path.includes('?') ? '&' : '?'}platform=pc`;
/** Daybreak URL of platform-independent reference data. */
const ps2Static = (path: string) => `${PS2_API_URL}/${path}`;
const platform = (path: string) => `${PLATFORM_API_URL}/${path}`;

describe('repositories', () => {
    let http: HttpTestingController;
    const inject = <T>(token: new () => T): T => TestBed.inject(token);

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

    const run = (cases: Case[]) => {
        for (const c of cases) {
            it(c.name, () => {
                c.call().subscribe();
                const req = http.expectOne(r => r.method === c.method && r.urlWithParams === c.url);
                if (c.body !== undefined) {
                    expect(req.request.body).toEqual(c.body);
                }
                req.flush(null);
            });
        }
    };

    describe('Voidwell.DaybreakGames (ps2/*)', () => {
        const world = { worldId: 17, zoneId: 2, startDate: '2024-01-01', endDate: '2024-01-02' };
        const snapshot = { worldId: 17, zoneId: 2, timestamp: '2024-01-01T00:00:00Z' };

        run([
            { name: 'AlertRepository.getAlerts', call: () => inject(AlertRepository).getAlerts(3), method: 'GET', url: ps2('alert/alerts/3') },
            { name: 'AlertRepository.getAlerts by world', call: () => inject(AlertRepository).getAlerts(0, 17), method: 'GET', url: ps2('alert/alerts/0?worldId=17') },
            { name: 'AlertRepository.getAlert', call: () => inject(AlertRepository).getAlert(17, 5), method: 'GET', url: ps2('alert/17/5') },

            { name: 'CharacterRepository.getCharacter', call: () => inject(CharacterRepository).getCharacter('c1'), method: 'GET', url: ps2('character/c1') },
            { name: 'CharacterRepository.getSessions', call: () => inject(CharacterRepository).getSessions('c1'), method: 'GET', url: ps2('character/c1/sessions?page=0') },
            { name: 'CharacterRepository.getSession', call: () => inject(CharacterRepository).getSession('c1', 9), method: 'GET', url: ps2('character/c1/sessions/9') },
            { name: 'CharacterRepository.getLiveSession', call: () => inject(CharacterRepository).getLiveSession('c1'), method: 'GET', url: ps2('character/c1/sessions/live') },
            { name: 'CharacterRepository.getOnlineState', call: () => inject(CharacterRepository).getOnlineState('c1'), method: 'GET', url: ps2('character/c1/state') },
            { name: 'CharacterRepository.getDirectives', call: () => inject(CharacterRepository).getDirectives('c1'), method: 'GET', url: ps2('character/c1/directives') },
            { name: 'CharacterRepository.getCharacterByName', call: () => inject(CharacterRepository).getCharacterByName('bob'), method: 'GET', url: ps2('character/byname/bob') },
            { name: 'CharacterRepository.getCharacterWeaponByName', call: () => inject(CharacterRepository).getCharacterWeaponByName('bob', 'gauss'), method: 'GET', url: ps2('character/byname/bob/weapon/gauss') },
            { name: 'CharacterRepository.getCharactersByName', call: () => inject(CharacterRepository).getCharactersByName(['a', 'b']), method: 'POST', url: ps2('character/byname'), body: ['a', 'b'] },

            { name: 'CombatReportRepository.getCombatReport', call: () => inject(CombatReportRepository).getCombatReport(world), method: 'POST', url: ps2('combatReport'), body: world },
            { name: 'FeedsRepository.getNews', call: () => inject(FeedsRepository).getNews(), method: 'GET', url: ps2Static('feeds/news') },
            { name: 'FeedsRepository.getUpdates', call: () => inject(FeedsRepository).getUpdates(), method: 'GET', url: ps2Static('feeds/updates') },
            { name: 'GradesRepository.getGrades', call: () => inject(GradesRepository).getGrades(), method: 'GET', url: ps2Static('grades') },

            {
                name: 'LeaderboardRepository.getWeaponLeaderboard',
                call: () => inject(LeaderboardRepository).getWeaponLeaderboard(1234, 2, 'kills', 'desc'),
                method: 'GET',
                url: ps2('leaderboard/weapon/1234?page=2&sort=kills&sortDir=desc')
            },

            { name: 'MapRepository.getZoneMap', call: () => inject(MapRepository).getZoneMap(2), method: 'GET', url: ps2('map/2') },
            { name: 'MapRepository.getTerritory', call: () => inject(MapRepository).getTerritory(17, 2), method: 'GET', url: ps2('map/territory/17/2') },
            { name: 'MapRepository.getPopulation', call: () => inject(MapRepository).getPopulation(17, 2), method: 'GET', url: ps2('map/population/17/2') },
            { name: 'MapRepository.getTerritoryFromDate', call: () => inject(MapRepository).getTerritoryFromDate(world), method: 'POST', url: ps2('map/territory'), body: world },
            { name: 'MapRepository.createSnapshot', call: () => inject(MapRepository).createSnapshot(snapshot), method: 'POST', url: ps2('map/snapshot/create'), body: snapshot },
            { name: 'MapRepository.getSnapshot', call: () => inject(MapRepository).getSnapshot(snapshot), method: 'POST', url: ps2('map/snapshot'), body: snapshot },

            { name: 'OracleRepository.getCategoryWeapons', call: () => inject(OracleRepository).getCategoryWeapons('all'), method: 'GET', url: ps2('oracle/category/all') },
            { name: 'OracleRepository.getStats', call: () => inject(OracleRepository).getStats('kdr', [1, 2]), method: 'GET', url: ps2('oracle/stats/kdr?q=1,2') },

            { name: 'OutfitRepository.getOutfit', call: () => inject(OutfitRepository).getOutfit('o1'), method: 'GET', url: ps2('outfit/o1') },
            { name: 'OutfitRepository.getMembers', call: () => inject(OutfitRepository).getMembers('o1'), method: 'GET', url: ps2('outfit/o1/members') },
            { name: 'OutfitRepository.getOutfitByAlias', call: () => inject(OutfitRepository).getOutfitByAlias('VOID'), method: 'GET', url: ps2('outfit/byalias/VOID') },

            { name: 'ProfileRepository.getProfiles', call: () => inject(ProfileRepository).getProfiles(), method: 'GET', url: ps2Static('profile') },
            { name: 'RankingsRepository.getPlayerRanks', call: () => inject(RankingsRepository).getPlayerRanks(), method: 'GET', url: ps2('ranks') },
            { name: 'SearchRepository.search', call: () => inject(SearchRepository).search('character', 'bob'), method: 'GET', url: ps2('search/character/bob') },
            { name: 'VehicleRepository.getVehicles', call: () => inject(VehicleRepository).getVehicles(), method: 'GET', url: ps2Static('vehicle') },
            { name: 'WeaponInfoRepository.getWeaponInfo', call: () => inject(WeaponInfoRepository).getWeaponInfo(1234), method: 'GET', url: ps2Static('weaponInfo/1234') },
            { name: 'WeaponInfoRepository.getWeaponInfoByName', call: () => inject(WeaponInfoRepository).getWeaponInfoByName('gauss'), method: 'GET', url: ps2('weaponInfo/byname/gauss') },

            { name: 'WorldRepository.getWorlds', call: () => inject(WorldRepository).getWorlds(), method: 'GET', url: ps2('world') },
            { name: 'WorldRepository.getWorldActivity', call: () => inject(WorldRepository).getWorldActivity(17, 6), method: 'GET', url: ps2('world/activity?worldId=17&period=6') },
            { name: 'WorldRepository.getPopulationHistory', call: () => inject(WorldRepository).getPopulationHistory([1, 17]), method: 'GET', url: ps2('world/population?q=1,17') },

            { name: 'WorldStateRepository.getWorldStates', call: () => inject(WorldStateRepository).getWorldStates(), method: 'GET', url: ps2('worldState') },
            { name: 'WorldStateRepository.getWorldState', call: () => inject(WorldStateRepository).getWorldState(17), method: 'GET', url: ps2('worldState/17') },
            { name: 'WorldStateRepository.getOnlinePlayers', call: () => inject(WorldStateRepository).getOnlinePlayers(17), method: 'GET', url: ps2('worldState/17/players') },
            { name: 'WorldStateRepository.getZoneOwnership', call: () => inject(WorldStateRepository).getZoneOwnership(17, 2), method: 'GET', url: ps2('worldState/17/2/map') },
            { name: 'WorldStateRepository.setupWorldZones', call: () => inject(WorldStateRepository).setupWorldZones(17), method: 'POST', url: ps2('worldState/17/zone') },

            { name: 'ZoneRepository.getZones', call: () => inject(ZoneRepository).getZones(), method: 'GET', url: ps2Static('zone') },
            { name: 'PsbUtilityRepository.getLastOnlineSessions', call: () => inject(PsbUtilityRepository).getLastOnlineSessions(), method: 'GET', url: ps2Static('psb/sessions') },

            { name: 'ServicesRepository.getStatus', call: () => inject(ServicesRepository).getStatus('feed', 'pc'), method: 'GET', url: ps2('services/feed/status') },
            { name: 'ServicesRepository.enable', call: () => inject(ServicesRepository).enable('feed', 'pc'), method: 'POST', url: ps2('services/feed/enable') },
            { name: 'ServicesRepository.disable', call: () => inject(ServicesRepository).disable('feed', 'pc'), method: 'POST', url: ps2('services/feed/disable') },

            { name: 'StoreRepository.forceUpdate', call: () => inject(StoreRepository).forceUpdate('ItemStore', 'pc'), method: 'POST', url: ps2('store/update/ItemStore') }
        ]);
    });

    describe('platform routing', () => {
        it('sends the platform selected in the UI', () => {
            TestBed.inject(Store).dispatch({ type: 'noop' });
            inject(WorldRepository).getWorldActivity(17, 1).subscribe();
            http.expectOne(ps2('world/activity?worldId=17&period=1')).flush(null);
        });

        it('queries all three instances for service states and tags each result', () => {
            let result: PlatformServiceState[] = [];
            inject(ServicesRepository).getAllStatuses().subscribe(r => (result = r));

            for (const platform of ['pc', 'ps4us', 'ps4eu']) {
                http.expectOne(ps2Static(`services/status?platform=${platform}`)).flush([{ name: 'feed', isEnabled: true }]);
            }

            expect(result.map(r => r.platform)).toEqual(['pc', 'ps4us', 'ps4eu']);
            expect(result.every(r => r.name === 'feed')).toBe(true);
        });

        it('keeps working when one instance is down', () => {
            let result: PlatformStoreUpdate[] = [];
            inject(StoreRepository).getUpdateLog().subscribe(r => (result = r));

            http.expectOne(ps2Static('store/updatelog?platform=pc')).flush([{ storeName: 'ItemStore' }]);
            http.expectOne(ps2Static('store/updatelog?platform=ps4us')).flush(null, { status: 503, statusText: 'Unavailable' });
            http.expectOne(ps2Static('store/updatelog?platform=ps4eu')).flush([]);

            expect(result).toEqual([{ storeName: 'ItemStore', platform: 'pc' }]);
        });
    });

    describe('Voidwell.Platform (platform/*)', () => {
        const blogPost = { title: 't', markdownContent: 'm' };
        const event = { id: 1, name: 'n', startDate: 's', endDate: 'e', isPrivate: false };

        run([
            { name: 'PostRepository.getPosts', call: () => inject(PostRepository).getPosts(), method: 'GET', url: platform('post?page=0') },
            { name: 'PostRepository.getPost', call: () => inject(PostRepository).getPost('p1'), method: 'GET', url: platform('post/p1') },
            { name: 'PostRepository.createPost', call: () => inject(PostRepository).createPost(blogPost), method: 'POST', url: platform('post'), body: blogPost },
            { name: 'PostRepository.deletePost', call: () => inject(PostRepository).deletePost('p1'), method: 'DELETE', url: platform('post/p1') },
            { name: 'PostRepository.getEditablePost', call: () => inject(PostRepository).getEditablePost('p1'), method: 'GET', url: platform('post/edit/p1') },
            { name: 'PostRepository.updatePost', call: () => inject(PostRepository).updatePost('p1', blogPost), method: 'PUT', url: platform('post/edit/p1'), body: blogPost },

            { name: 'CustomEventRepository.getEvents', call: () => inject(CustomEventRepository).getEvents(), method: 'GET', url: platform('gameevent') },
            { name: 'CustomEventRepository.getEventsByGame', call: () => inject(CustomEventRepository).getEventsByGame('ps2'), method: 'GET', url: platform('gameevent/game/ps2') },
            { name: 'CustomEventRepository.getEvent', call: () => inject(CustomEventRepository).getEvent(1), method: 'GET', url: platform('gameevent/1') },
            { name: 'CustomEventRepository.createEvent', call: () => inject(CustomEventRepository).createEvent(event), method: 'POST', url: platform('gameevent'), body: event },
            { name: 'CustomEventRepository.updateEvent', call: () => inject(CustomEventRepository).updateEvent(1, event), method: 'PUT', url: platform('gameevent/1'), body: event },
            { name: 'CustomEventRepository.deleteEvent', call: () => inject(CustomEventRepository).deleteEvent(1), method: 'DELETE', url: platform('gameevent/1') },

            { name: 'UtilsRepository.getServerTime', call: () => inject(UtilsRepository).getServerTime(), method: 'GET', url: platform('utils/time') }
        ]);
    });

    it('serves every Daybreak route under ps2/ and every Platform route under platform/', () => {
        expect(PS2_API_URL.endsWith('/ps2')).toBe(true);
        expect(PLATFORM_API_URL.endsWith('/platform')).toBe(true);
    });
});
