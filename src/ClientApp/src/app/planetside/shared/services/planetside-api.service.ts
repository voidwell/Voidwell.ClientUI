import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../../../shared/services/voidwell-auth.service';
import { RequestCache } from './../../../shared/services/request-cache.service';
import { ApiBase } from './../../../shared/services/api-base';

@Injectable()
export class PlanetsideApi extends ApiBase {
    public ps2Url = location.origin + '/api/ps2/';

    constructor(public authService: VoidwellAuthService, public http: HttpClient, public cache: RequestCache) {
        super(authService, http, cache);
    }

    getNews() {
        return this.Get(this.ps2Url + 'feeds/news');
    }

    getUpdates() {
        return this.Get(this.ps2Url + 'feeds/updates');
    }

    search(query: string) {
        return this.Get(this.ps2Url + 'search/' + query);
    }

    getWeaponInfo(itemId: string) {
        return this.Get(this.ps2Url + 'weaponinfo/' + itemId);
    }

    getWeaponLeaderboard(itemId: string) {
        return this.Get(this.ps2Url + 'leaderboard/weapon/' + itemId);
    }

    getCharacter(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId);
    }

    getCharacterSessions(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/sessions');
    }

    getCharacterSession(characterId: string, sessionId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/sessions/' + sessionId);
    }

    getCharacterOnlineState(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/state');
    }

    getAllProfiles() {
        return this.Get(this.ps2Url + 'profile', true);
    }

    getAllVehicles() {
        return this.Get(this.ps2Url + 'vehicle', true);
    }

    getAllWorlds() {
        return this.Get(this.ps2Url + 'world', true);
    }

    getWorldPopulationHistory(worldIds: number[]) {
        return this.Get(this.ps2Url + 'world/population/?q=' + worldIds.join(','));
    }

    getWorldActivity(worldId: number, period: number) {
        return this.Get(this.ps2Url + 'world/activity/?worldId=' + worldId + '&period=' + period);
    }

    getAllZones() {
        return this.Get(this.ps2Url + 'zone', true);
    }

    getOutfit(outfitId: string) {
        return this.Get(this.ps2Url + 'outfit/' + outfitId);
    }

    getOutfitMembers(outfitId: string) {
        return this.Get(this.ps2Url + 'outfit/' + outfitId + '/members');
    }

    getAlerts(pageNumber: number) {
        return this.Get(this.ps2Url + 'alert/alerts/' + pageNumber);
    }

    getAlertsByWorldId(pageNumber: number, worldId: number) {
        return this.Get(this.ps2Url + 'alert/alerts/' + pageNumber + '?worldId=' + worldId);
    }

    getAlert(worldId: string, alertId: string) {
        return this.Get(this.ps2Url + 'alert/' + worldId + '/' + alertId);
    }

    getWorldState(worldId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId);
    }

    getWorldStates() {
        return this.Get(this.ps2Url + 'worldstate');
    }

    getOnlinePlayers(worldId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId + '/players');
    }

    getZoneMap(zoneId: number) {
        return this.Get(this.ps2Url + 'map/' + zoneId, true);
    }

    getZoneOwnership(worldId: number, zoneId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId + '/' + zoneId + '/map');
    }

    getGrades() {
        return this.Get(this.ps2Url + 'grades', true);
    }

    getOracleWeapons(categoryId: string) {
        return this.Get(this.ps2Url + 'oracle/category/' + categoryId, true);
    }

    getOracleData(statId: string, weaponIds: number[]) {
        return this.Get(this.ps2Url + 'oracle/stats/' + statId + '/?q=' + weaponIds.join(','));
    }

    getPlayerRanks() {
        return this.Get(this.ps2Url + 'ranks');
    }

    getMultiplePlayerStatsByName(characterNames: string[]) {
        return this.Post(this.ps2Url + 'character/byname', characterNames);
    }
}