import { Component } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsidePlayerComponent } from './../../planetside-player.component';
import { PlanetsideApi } from './../../../planetside-api.service';

@Component({
    templateUrl: './planetside-player-sessions-list.template.html',
    styleUrls: ['./planetside-player-sessions-list.styles.css']
})

export class PlanetsidePlayerSessionsListComponent {
    isLoading: boolean;
    errorMessage: string = null;

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
                    .pipe<any>(catchError(error => {
                        this.errorMessage = error._body
                        return Observable.throw(error);
                    }))
                    .pipe<any>(finalize(() => {
                        this.isLoading = false;
                    }))
                    .subscribe(sessions => {
                        this.sessions = sessions.sort(this.sortSessions);
                        this.dataSource = new SessionsDataSource(this.sessions);
                    });
            }
        });
    }

    private sortSessions(a, b) {
        if (a.loginDate < b.loginDate)
            return 1
        if (a.loginDate > b.loginDate)
            return -1;
        return 0;
    }
}

export class SessionsDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        return of(this.data);
    }

    disconnect() { }
}