import { Component } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { PlanetsidePlayerComponent } from './../../planetside-player.component';
import { PlanetsideApi } from './../../../planetside-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';

@Component({
    templateUrl: './planetside-player-sessions-list.template.html',
    styleUrls: ['./planetside-player-sessions-list.styles.css']
})

export class PlanetsidePlayerSessionsListComponent {
    private isLoading: boolean;
    private errorMessage: string = null;
    private sessions: any[];
    private playerData: any;

    private dataSource: DataSource<any>;

    constructor(private planetsidePlayer: PlanetsidePlayerComponent, private api: PlanetsideApi) {
        this.isLoading = true;

        this.planetsidePlayer.playerData.subscribe(data => {
            this.isLoading = true;
            this.errorMessage = null;
            this.sessions = [];
            this.playerData = data;

            if (this.playerData !== null) {
                this.api.getCharacterSessions(this.playerData.id)
                    .catch(error => {
                        this.errorMessage = error._body
                        return Observable.throw(error);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    })
                    .subscribe(sessions => {
                        this.sessions = sessions.sort(this.sortSessions);
                        this.dataSource = new SessionsDataSource(this.sessions);
                    });
            }
        });
    }

    private sortSessions(a, b) {
        if (a.stats.loginDate < b.stats.loginDate)
            return 1
        if (a.stats.loginDate > b.stats.loginDate)
            return -1;
        return 0;
    }
}

export class SessionsDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        return Observable.of(this.data);
    }

    disconnect() { }
}