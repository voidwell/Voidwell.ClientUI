import { Component, OnDestroy, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

@Component({
    selector: 'voidwell-admin-events',
    templateUrl: './events.template.html'
})

export class EventsComponent implements OnDestroy {
    isLoading: boolean = true;
    errorMessage: string = null;
    getEventsRequest: Subscription;

    private dataSource: TableDataSource;

    constructor(private api: VoidwellApi, private dialog: MatDialog) {
        this.isLoading = true;

        this.getEventsRequest = this.api.getCustomEvents()
            .subscribe(events => {
                this.dataSource = new TableDataSource(events);

                this.isLoading = false;
            });
    }

    onEdit(event: any) {
        let dialogRef = this.dialog.open(EventEditorDialog, {
            data: { event: event }
        });
    }

    newEvent() {
        let dialogRef = this.dialog.open(EventEditorDialog, {
            data: { event: null }
        });

        dialogRef.afterClosed().subscribe(result => {
            //Todo: save event after editing.
        });
    }

    ngOnDestroy() {
        if (this.getEventsRequest) {
            this.getEventsRequest.unsubscribe();
        }
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first).map(() => {
            const data = this.data.slice();

            return data;
        });
    }

    disconnect() { }
}

@Component({
    selector: 'event-editor-dialog',
    templateUrl: 'event-editor-dialog.html',
})
export class EventEditorDialog {
    form: FormGroup;

    servers = [
        { id: "1", name: "Connery" },
        { id: "10", name: "Miller" },
        { id: "13", name: "Cobalt" },
        { id: "17", name: "Emerald" },
        { id: "19", name: "Jaeger" },
        { id: "25", name: "Briggs" }
    ];

    maps = [
        { id: "2", name: "Indar" },
        { id: "4", name: "Hossin" },
        { id: "6", name: "Amerish" },
        { id: "8", name: "Esamir" }
    ];

    defaultTeams = [
        { teamId: "1", name: "Vanu Sovereignty", enabled: true },
        { teamId: "2", name: "New Conglomerate", enabled: true },
        { teamId: "3", name: "Terran Republic", enabled: true }
    ];

    teams: any[];
    createEvent: boolean = false;

    constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<EventEditorDialog>, private api: VoidwellApi, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.teams = this.defaultTeams.slice();

        let event = Object.assign({}, this.data.event);

        if (event != null) {
            this.teams.forEach(function (team) {
                var teamIdx = event.teams.map(function (t) { return t.teamId }).indexOf(team.teamId);
                if (teamIdx > -1) {
                    Object.assign(team, event.teams[teamIdx]);
                } else {
                    team.enabled = false;
                }
            });
        }
        else
        {
            this.createEvent = true;
            event = {
                name: null,
                description: null,
                startDate: null,
                endDate: null,
                gameId: 'ps2',
                isPrivate: false,
                mapId: this.maps[0].id,
                serverId: this.servers[0].id,
                teams: []
            };
        }

        this.form = this.formBuilder.group({
            name: event.name,
            description: event.description,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            isPrivate: event.isPrivate,
            mapId: event.mapId,
            serverId: event.serverId,
            gameId: event.gameId,
            teams: new FormArray(event.teams)
        });
    }

    saveEvent(event: any, teams: any) {
        event.teams = [];
        teams.forEach(function (team) {
            if (team.enabled) {
                var eventTeam = {
                    teamId: team.teamId,
                    name: team.name
                };
                event.teams.push(eventTeam);
            }
        });

        if (this.createEvent) {
            this.api.createCustomEvent(event)
                .subscribe(result => {
                    Object.assign(this.data.event, result);
                    this.createEvent = false;
                });
        }
        else {
            this.api.updateCustomEvent(event.id, event)
                .subscribe(result => {
                    Object.assign(this.data.event, result);
                });
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}