import { Component, OnDestroy, Inject, OnInit, OnChanges } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';

@Component({
    selector: 'voidwell-admin-events',
    templateUrl: './events.template.html'
})

export class EventsComponent implements OnDestroy {
    isLoading: boolean = true;
    errorMessage: string = null;
    getEventsRequest: Subscription;

    private events: any[];
    private dataSource: TableDataSource;

    constructor(private api: VoidwellApi, private dialog: MatDialog) {
        this.isLoading = true;

        this.getEventsRequest = this.api.getCustomEvents()
            .subscribe(events => {
                this.events = events;
                this.dataSource = new TableDataSource(this.events);

                this.isLoading = false;
            });
    }

    onEdit(event: any) {
        let dialogRef = this.dialog.open(EventEditorDialog, {
            data: { event: event }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }

            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].id == result.id) {
                    this.events[i] = result;
                    this.dataSource.refresh();
                    return;
                }
            }

            this.events.push(result);
            this.dataSource.refresh();
        });
    }

    ngOnDestroy() {
        if (this.getEventsRequest) {
            this.getEventsRequest.unsubscribe();
        }
    }
}

export class TableDataSource extends DataSource<any> {
    private dataSubject: BehaviorSubject<any>;

    constructor(private data: any[]) {
        super();

        this.dataSubject = new BehaviorSubject(this.data);
    }

    connect(): Observable<any[]> {
        let first = this.dataSubject;
        return Observable.merge(first).map(() => {
            return this.data.sort((a, b) => a.startDate < b.startDate ? 1 : -1);
        });
    }

    refresh() {
        this.dataSubject.next(this.data);
    }

    disconnect() { }
}

@Component({
    selector: 'event-editor-dialog',
    templateUrl: 'event-editor-dialog.html',
})
export class EventEditorDialog implements OnInit, OnChanges {
    form: FormGroup;
    event: any;

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

    constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<EventEditorDialog>, private api: VoidwellApi, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.form = this.formBuilder.group({
            id: new FormControl(),
            name: ['', Validators.required],
            description: new FormControl(),
            startDate: new FormControl(),
            endDate: new FormControl(),
            isPrivate: new FormControl(false),
            mapId: new FormControl(),
            serverId: new FormControl(),
            gameId: new FormControl('ps2'),
            teams: this.formBuilder.array([])
        });
    };

    get teamForm() { return <FormArray>this.form.get('teams'); }

    ngOnInit() {
        if (this.data.event) {
            this.event = Object.assign({}, this.data.event);
            this.ngOnChanges();
        }
        else {
            this.setupTeams(this.defaultTeams);
        }
    }

    ngOnChanges() {
        let self = this;

        this.form.reset({
            id: this.event.id
        });

        this.form.setControl('name', new FormControl(this.event.name));
        this.form.setControl('description', new FormControl(this.event.description));
        this.form.setControl('startDate', new FormControl(new Date(this.event.startDate)));
        this.form.setControl('endDate', new FormControl(new Date(this.event.endDate)));
        this.form.setControl('isPrivate', new FormControl(this.event.isPrivate));
        this.form.setControl('mapId', new FormControl(this.event.mapId));
        this.form.setControl('serverId', new FormControl(this.event.serverId));
        this.form.setControl('gameId', new FormControl(this.event.gameId));

        this.setupTeams(this.event.teams);
    }

    setupTeams(inputTeams: any[]) {
        let teams = this.defaultTeams.slice();

        teams.forEach(function (team) {
            var teamIdx = inputTeams.map(function (t) { return t.teamId }).indexOf(team.teamId);
            if (teamIdx > -1) {
                Object.assign(team, inputTeams[teamIdx]);
            } else {
                team.enabled = false;
            }
        });

        let teamFGs = teams.map(team => this.formBuilder.group(team));
        let teamFormArray = this.formBuilder.array(teamFGs);
        this.form.setControl('teams', teamFormArray);
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }

        this.event = this.prepareSaveEvent();

        if (this.event.id) {
            this.api.updateCustomEvent(this.event.id, this.event)
                .subscribe(result => {
                    this.dialogRef.close(result);
                });
        }
        else {
            this.api.createCustomEvent(this.event)
                .subscribe(result => {
                    this.dialogRef.close(result);
                });
        }
    }

    prepareSaveEvent() {
        let eventModel = this.form.value;

        let saveEvent = {
            id: eventModel.id,
            name: eventModel.name,
            description: eventModel.description,
            startDate: eventModel.startDate,
            endDate: eventModel.endDate,
            isPrivate: eventModel.isPrivate,
            mapId: eventModel.mapId,
            serverId: eventModel.serverId,
            gameId: eventModel.gameId,
            teams: []
        };

        eventModel.teams.forEach(function (team) {
            if (team.enabled) {
                var eventTeam = {
                    teamId: team.teamId,
                    name: team.name
                };
                saveEvent.teams.push(eventTeam);
            }
        });

        return saveEvent;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}