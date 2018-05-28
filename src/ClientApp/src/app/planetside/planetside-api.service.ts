import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../shared/services/voidwell-auth.service';
import { ApiBase } from './../shared/services/api-base';

@Injectable()
export class PlanetsideApi extends ApiBase {
    public ps2Url = location.origin + '/api/ps2/';

    constructor(public authService: VoidwellAuthService, public http: Http) {
        super(authService, http);
    }

    getNews() {
        return this.Get(this.ps2Url + 'feeds/news')
            .map(resp => resp.json());
    }

    getUpdates() {
        return this.Get(this.ps2Url + 'feeds/updates')
            .map(resp => resp.json());
    }

    search(query: string) {
        return this.Get(this.ps2Url + 'search/' + query)
            .map(resp => resp.json());
    }

    getWeaponInfo(itemId: string) {
        return this.Get(this.ps2Url + 'weaponinfo/' + itemId)
            .map(resp => resp.json());
    }

    getWeaponLeaderboard(itemId: string) {
        return this.Get(this.ps2Url + 'leaderboard/weapon/' + itemId)
            .map(resp => resp.json());
    }

    getCharacter(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId)
            .map(resp => resp.json());
    }

    getCharacterSessions(characterId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/sessions')
            .map(resp => resp.json());
    }

    getCharacterSession(characterId: string, sessionId: string) {
        return this.Get(this.ps2Url + 'character/' + characterId + '/sessions/' + sessionId)
            .map(resp => resp.json());
    }

    getAllProfiles() {
        return this.Get(this.ps2Url + 'profile')
            .map(resp => resp.json());
    }

    getAllVehicles() {
        return this.Get(this.ps2Url + 'vehicle')
            .map(resp => resp.json());
    }

    getOutfit(outfitId: string) {
        return this.Get(this.ps2Url + 'outfit/' + outfitId)
            .map(resp => resp.json());
    }

    getOutfitMembers(outfitId: string) {
        return this.Get(this.ps2Url + 'outfit/' + outfitId + '/members')
            .map(resp => resp.json());
    }

    getAllAlerts() {
        return this.Get(this.ps2Url + 'alert')
            .map(resp => resp.json());
    }

    getAllAlertsByWorldId(worldId: string) {
        return this.Get(this.ps2Url + 'alert/' + worldId)
            .map(resp => resp.json());
    }

    getAlert(worldId: string, alertId: string) {
        return this.Get(this.ps2Url + 'alert/' + worldId + '/' + alertId)
            .map(resp => resp.json());
    }

    getWorldStates() {
        return this.Get(this.ps2Url + 'worldstate')
            .map(resp => resp.json());
    }

    getOnlinePlayers(worldId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId + '/players')
            .map(resp => resp.json());
    }

    getZoneMap(zoneId: number) {
        return this.Get(this.ps2Url + 'map/' + zoneId)
            .map(resp => resp.json());
    }

    getZoneOwnership(worldId: number, zoneId: number) {
        return this.Get(this.ps2Url + 'worldstate/' + worldId + '/' + zoneId + '/map')
            .map(resp => resp.json());
    }

    getGrades() {
        return this.Get(this.ps2Url + 'grades')
            .map(resp => resp.json());
    }
}