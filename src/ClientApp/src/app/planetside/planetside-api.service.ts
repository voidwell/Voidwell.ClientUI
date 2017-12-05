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

    private extractData(res: Response, key?: string) {
        let body = res.json();
        if (key) {
            return body[key];
        }
        return body.data || {};
    }
}