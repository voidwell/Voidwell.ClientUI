﻿import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { VoidwellAuthService } from './../../../shared/services/voidwell-auth.service';
import { RequestCache } from './../../../shared/services/request-cache.service';
import { ApiBase } from './../../../shared/services/api-base';
import { AppState } from '../../../store/app.states';
import { selectPlanetsideState } from '../../store/planetside.states';

@Injectable()
export class PlanetsideApi extends ApiBase implements OnDestroy {
    apiRoot = `${location.protocol}//api.${location.host}`
    public ps2Url = `${this.apiRoot}/ps2/`;
    
    private platformSub: Subscription;
    private platform: string = 'pc';

    constructor(public authService: VoidwellAuthService, public http: HttpClient, public cache: RequestCache, public store : Store<AppState>) {
        super(authService, http, cache, store);

        this.platformSub = this.store.select(selectPlanetsideState)
            .subscribe(state => {
                this.platform = state.platform
            });
    }

    getNews() {
        return this.Get(`${this.ps2Url}feeds/news`);
    }

    getUpdates() {
        return this.Get(`${this.ps2Url}feeds/updates`);
    }

    search(category: string, query: string) {
        return this.Get(`${this.ps2Url}search/${category}/${query}?platform=${this.platform}`);
    }

    getWeaponInfo(itemId: string) {
        return this.Get(`${this.ps2Url}weaponinfo/${itemId}`);
    }

    getWeaponLeaderboard(itemId: string, page: number = 1, sort: string, sortDir: string) {
        return this.Get(`${this.ps2Url}leaderboard/weapon/${itemId}?platform=${this.platform}&page=${page}&sort=${sort}&sortDir=${sortDir}`);
    }

    getCharacter(characterId: string) {
        return this.Get(`${this.ps2Url}character/${characterId}?platform=${this.platform}`);
    }

    getCharacterSessions(characterId: string) {
        return this.Get(`${this.ps2Url}character/${characterId}/sessions?platform=${this.platform}`);
    }

    getCharacterSession(characterId: string, sessionId: string) {
        return this.Get(`${this.ps2Url}character/${characterId}/sessions/${sessionId}?platform=${this.platform}`);
    }

    getCharacterOnlineState(characterId: string) {
        return this.Get(`${this.ps2Url}character/${characterId}/state?platform=${this.platform}`);
    }

    getCharacterDirectives(characterId: string) {
        return this.Get(`${this.ps2Url}character/${characterId}/directives?platform=${this.platform}`);
    }

    getAllProfiles() {
        return this.Get(`${this.ps2Url}profile`, true);
    }

    getAllVehicles() {
        return this.Get(`${this.ps2Url}vehicle`, true);
    }

    getAllWorlds() {
        return this.Get(`${this.ps2Url}world?platform=${this.platform}`, true);
    }

    getWorldPopulationHistory(worldIds: number[]) {
        return this.Get(`${this.ps2Url}world/population/?q=${worldIds.join(',')}&platform=${this.platform}`);
    }

    getWorldActivity(worldId: number, period: number) {
        return this.Get(`${this.ps2Url}world/activity/?worldId=${worldId}&period=${period}&platform=${this.platform}`);
    }

    getAllZones() {
        return this.Get(`${this.ps2Url}zone`, true);
    }

    getOutfit(outfitId: string) {
        return this.Get(`${this.ps2Url}outfit/${outfitId}?platform=${this.platform}`);
    }

    getOutfitMembers(outfitId: string) {
        return this.Get(`${this.ps2Url}outfit/${outfitId}/members?platform=${this.platform}`);
    }

    getAlerts(pageNumber: number) {
        return this.Get(`${this.ps2Url}alert/alerts/${pageNumber}?platform=${this.platform}`);
    }

    getAlertsByWorldId(pageNumber: number, worldId: number) {
        return this.Get(`${this.ps2Url}alert/alerts/${pageNumber}?worldId=${worldId}&platform=${this.platform}`);
    }

    getAlert(worldId: string, alertId: string) {
        return this.Get(`${this.ps2Url}alert/${worldId}/${alertId}?platform=${this.platform}`);
    }

    getWorldState(worldId: number) {
        return this.Get(`${this.ps2Url}worldstate/${worldId}?platform=${this.platform}`);
    }

    getWorldStates() {
        return this.Get(`${this.ps2Url}worldstate?platform=${this.platform}`);
    }

    getOnlinePlayers(worldId: number) {
        return this.Get(`${this.ps2Url}worldstate/${worldId}/players?platform=${this.platform}`);
    }

    getZoneMap(zoneId: number) {
        return this.Get(`${this.ps2Url}map/${zoneId}?platform=${this.platform}`, true);
    }

    getZoneOwnership(worldId: number, zoneId: number) {
        return this.Get(`${this.ps2Url}worldstate/${worldId}/${zoneId}/map?platform=${this.platform}`);
    }

    getGrades() {
        return this.Get(`${this.ps2Url}grades`, true);
    }

    getOracleWeapons(categoryId: string) {
        return this.Get(`${this.ps2Url}oracle/category/${categoryId}?platform=${this.platform}`, true);
    }

    getOracleData(statId: string, weaponIds: number[]) {
        return this.Get(`${this.ps2Url}oracle/stats/${statId}/?q=${weaponIds.join(',')}&platform=${this.platform}`);
    }

    getPlayerRanks() {
        return this.Get(`${this.ps2Url}ranks?platform=${this.platform}`);
    }

    getMultiplePlayerStatsByName(characterNames: string[]) {
        return this.Post(`${this.ps2Url}character/byname?platform=${this.platform}`, characterNames);
    }

    ngOnDestroy(): void {
        if (this.platformSub) this.platformSub.unsubscribe();
    }
}
