import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw';
import { Http, RequestOptions, Response } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../app.component';
import { Injectable } from '@angular/core';
import * as actionType from '../reducers';

@Injectable()
export class PlanetsideApi {
    public ps2Url = location.origin + '/api/ps2/';

    constructor(public http: Http, public ngRedux: NgRedux<IAppState>) {
    }

    getNews() {
        return this.http.get(this.ps2Url + 'feeds/news')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getUpdates() {
        return this.http.get(this.ps2Url + 'feeds/updates')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    search(query: string) {
        return this.http.get(this.ps2Url + 'search/' + query)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getWeaponInfo(itemId: string) {
        return this.http.get(this.ps2Url + 'weaponinfo/' + itemId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getWeaponLeaderboard(itemId: string) {
        return this.http.get(this.ps2Url + 'leaderboard/weapon/' + itemId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getCharacter(characterId: string) {
        return this.http.get(this.ps2Url + 'character/' + characterId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getCharacterSessions(characterId: string) {
        return this.http.get(this.ps2Url + 'character/' + characterId + '/sessions')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getCharacterSession(characterId: string, sessionId: string) {
        return this.http.get(this.ps2Url + 'character/' + characterId + '/sessions/' + sessionId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getAllProfiles() {
        return this.http.get(this.ps2Url + 'profile')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getAllVehicles() {
        return this.http.get(this.ps2Url + 'vehicle')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getOutfit(outfitId: string) {
        return this.http.get(this.ps2Url + 'outfit/' + outfitId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getOutfitMembers(outfitId: string) {
        return this.http.get(this.ps2Url + 'outfit/' + outfitId + '/members')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getAllAlerts() {
        return this.http.get(this.ps2Url + 'alert')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getAllAlertsByWorldId(worldId: string) {
        return this.http.get(this.ps2Url + 'alert/' + worldId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getAlert(worldId: string, alertId: string) {
        return this.http.get(this.ps2Url + 'alert/' + worldId + '/' + alertId)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getWorldStates() {
        return this.http.get(this.ps2Url + 'worldstate')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }

    getOnlinePlayers(worldId: string) {
        return this.http.get(this.ps2Url + 'worldstate/' + worldId + '/players')
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return Observable.throw(error);
            });
    }
}