import { Component, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsidePlayerComponent } from './../../planetside-player.component';
import { PlanetsideApi } from './../../../planetside-api.service';

@Component({
    templateUrl: './planetside-player-session.template.html',
    styleUrls: ['./planetside-player-session.styles.css']
})

export class PlanetsidePlayerSessionComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string = null;

    private routeSub: any;
    private dataSub: any;
    private session: any;
    private sessionStats: any;
    private playerData: any;

    private dataSource: DataSource<any>;

    constructor(private planetsidePlayer: PlanetsidePlayerComponent, private api: PlanetsideApi, private route: ActivatedRoute) {
        this.isLoading = true;

        this.dataSub = this.planetsidePlayer.playerData.subscribe(data => {
            this.isLoading = true;
            this.errorMessage = null;
            this.session = null;
            this.playerData = data;
            this.sessionStats = {
                kills: 0,
                deaths: 0,
                teamkills: 0,
                suicides: 0,
                headshots: 0,
                facilitiesCaptured: 0,
                facilitiesDefended: 0
            };

            this.routeSub = this.route.params.subscribe(params => {
                let sessionId = params['id'];

                if (this.playerData !== null) {
                    this.api.getCharacterSession(this.playerData.id, sessionId)
                        .pipe<any>(catchError(error => {
                            this.errorMessage = error._body;
                            return throwError(error);
                        }))
                        .pipe<any>(finalize(() => {
                            this.isLoading = false;
                        }))
                        .subscribe(data => {
                            this.session = data.session;
                            this.calculateSessionStats(data.events);
                            this.dataSource = new SessionDataSource(data.events);
                        });
                }
            });
        });
    }

    private calculateSessionStats(events: any[]) {
        for (let i = 0; i < events.length; i++) {
            let event = events[i];

            switch (event.eventType) {
                case 'Death':
                    if (event.attacker.id === this.playerData.id &&
                        event.attacker.id !== event.victim.id &&
                        event.attacker.factionId !== event.victim.factionId) {
                        this.sessionStats.kills++;

                        if (event.isHeadshot) {
                            this.sessionStats.headshots++;
                        }
                    }

                    if (event.attacker.id === this.playerData.id &&
                        event.attacker.id !== event.victim.id &&
                        event.attacker.factionId === event.victim.factionId) {
                        this.sessionStats.teamkills++;
                    }

                    if (event.victim.id === this.playerData.id) {
                        this.sessionStats.deaths++;
                    }

                    if (event.attacker.id === this.playerData.id &&
                        event.attacker.id === event.victim.id) {
                        this.sessionStats.suicides++;
                    }
                    break;

                case 'FacilityCapture':
                    this.sessionStats.facilitiesCaptured++;
                    break;

                case 'FacilityDefend':
                    this.sessionStats.facilitiesDefended++;
                    break;
            }
        }
    }

    ngOnDestroy() {
        this.dataSub.unsubscribe();
        this.routeSub.unsubscribe();
    }
}

export class SessionDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        return of(this.data);
    }

    disconnect() { }
}