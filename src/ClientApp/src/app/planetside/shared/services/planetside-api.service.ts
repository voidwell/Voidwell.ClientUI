import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../../../shared/services/voidwell-auth.service';
import { RequestCache } from './../../../shared/services/request-cache.service';
import { ApiBase } from './../../../shared/services/api-base';

@Injectable()
export class PlanetsideApi extends ApiBase {
    public ps2Url = location.origin + '/api/ps2/';

    constructor(public authService: VoidwellAuthService, public http: Http, public cache: RequestCache) {
        super(authService, http, cache);
    }

    getNews() {
        return this.Get(this.ps2Url + 'feeds/news')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getUpdates() {
        return this.Get(this.ps2Url + 'feeds/updates')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    search(query: string) {
        return this.Get(this.ps2Url + 'search/' + query)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getWeaponInfo(itemId: string) {
        return this.Get(this.ps2Url + 'weaponinfo/' + itemId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getWeaponLeaderboard(itemId: string) {
        return this.Get(this.ps2Url + 'leaderboard/weapon/' + itemId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getCharacter(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getCharacterSessions(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/sessions')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getCharacterSession(characterId: string, sessionId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/sessions/' + sessionId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getCharacterOnlineState(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/state')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAllProfiles() {
        return this.Get(this.ps2Url + 'profile', true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAllVehicles() {
        return this.Get(this.ps2Url + 'vehicle', true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAllWorlds() {
        return this.Get(this.ps2Url + 'world', true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getWorldPopulationHistory(worldIds: number[]) {
        return this.Get(this.ps2Url + 'world/population/?q=' + worldIds.join(','))
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAllZones() {
        return this.Get(this.ps2Url + 'zone', true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getOutfit(outfitId: string) {
        return this.Get(this.ps2Url + 'outfit/' + outfitId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getOutfitMembers(outfitId: string) {
        return this.Get(this.ps2Url + 'outfit/' + outfitId + '/members')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAlerts(pageNumber: number) {
        return this.Get(this.ps2Url + 'alert/alerts/' + pageNumber)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAlertsByWorldId(pageNumber: number, worldId: number) {
        return this.Get(this.ps2Url + 'alert/alerts/' + pageNumber + '?worldId=' + worldId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAlert(worldId: string, alertId: string) {
        return this.Get(this.ps2Url + 'alert/' + worldId + '/' + alertId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getWorldStates() {
        return this.Get(this.ps2Url + 'worldstate')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getOnlinePlayers(worldId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId + '/players')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getZoneMap(zoneId: number) {
        return this.Get(this.ps2Url + 'map/' + zoneId, true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getZoneOwnership(worldId: number, zoneId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId + '/' + zoneId + '/map')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getGrades() {
        return this.Get(this.ps2Url + 'grades', true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getOracleWeapons(categoryId: string) {
        return this.Get(this.ps2Url + 'oracle/category/' + categoryId, true)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getOracleData(statId: string, weaponIds: number[]) {
        return this.Get(this.ps2Url + 'oracle/stats/' + statId + '/?q=' + weaponIds.join(','))
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getPlayerRanks() {
        return this.Get(this.ps2Url + 'ranks')
            .pipe(map<Response, any>(resp => resp.json()));
    }
}