import { Component, ChangeDetectionStrategy, OnInit, OnChanges, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomEvent, CustomEventTeam } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatCheckbox } from '@angular/material/checkbox';

/** A team row of the event editor: the team plus whether it takes part. */
interface TeamSelection extends CustomEventTeam {
    enabled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'event-editor-dialog',
    templateUrl: './event-editor-dialog.component.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        MatSlideToggle,
        MatSelect,
        MatOption,
        MatDatetimepickerModule,
        MatSuffix,
        MatCheckbox,
        MatIcon,
        NgClass,
        MatButton,
    ],
})
export class EventEditorDialog implements OnInit, OnChanges {
    private formBuilder = inject(FormBuilder);
    dialogRef = inject<MatDialogRef<EventEditorDialog>>(MatDialogRef);
    private customEventRepository = inject(CustomEventRepository);
    data = inject<{ event?: CustomEvent }>(MAT_DIALOG_DATA);

    form: FormGroup;
    event: CustomEvent;

    servers = [
        { id: "1", name: "Connery" },
        { id: "10", name: "Miller" },
        { id: "13", name: "Cobalt" },
        { id: "17", name: "Emerald" },
        { id: "19", name: "Jaeger" },
        { id: "25", name: "Briggs" },
        { id: "40", name: "SolTech" }
    ];

    maps = [
        { id: "2", name: "Indar" },
        { id: "4", name: "Hossin" },
        { id: "6", name: "Amerish" },
        { id: "8", name: "Esamir" },
        { id: "344", name: "Oshur" }
    ];

    defaultTeams: TeamSelection[] = [
        { teamId: "1", name: "Vanu Sovereignty", enabled: true },
        { teamId: "2", name: "New Conglomerate", enabled: true },
        { teamId: "3", name: "Terran Republic", enabled: true }
    ];

    constructor() {
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

    setupTeams(inputTeams: Array<Partial<TeamSelection> & { teamId: string }>) {
        const teams = this.defaultTeams.slice();

        teams.forEach((team) => {
            const teamIdx = inputTeams.map((t) => { return t.teamId }).indexOf(team.teamId);
            if (teamIdx > -1) {
                Object.assign(team, inputTeams[teamIdx]);
            } else {
                team.enabled = false;
            }
        });

        const teamFGs = teams.map(team => this.formBuilder.group(team));
        const teamFormArray = this.formBuilder.array(teamFGs);
        this.form.setControl('teams', teamFormArray);
    }

    getFactionColor(id: number | string) {
        const factions: Record<number, string> = {
            1: 'faction-vs-text',
            2: 'faction-nc-text',
            3: 'faction-tr-text'
        };
        return factions[Number(id)];
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }

        this.event = this.prepareSaveEvent();

        if (this.event.id) {
            this.customEventRepository.updateEvent(this.event.id, this.event)
                .subscribe(result => {
                    this.dialogRef.close(result);
                });
        }
        else {
            this.customEventRepository.createEvent(this.event)
                .subscribe(result => {
                    this.dialogRef.close(result);
                });
        }
    }

    prepareSaveEvent(): CustomEvent {
        const eventModel = this.form.value;

        const saveEvent = {
            id: eventModel.id,
            name: eventModel.name,
            description: eventModel.description,
            startDate: eventModel.startDate,
            endDate: eventModel.endDate,
            isPrivate: eventModel.isPrivate,
            mapId: eventModel.mapId,
            serverId: eventModel.serverId,
            gameId: eventModel.gameId,
            teams: [] as CustomEventTeam[]
        };

        eventModel.teams.forEach((team: TeamSelection) => {
            if (team.enabled) {
                const eventTeam = {
                    customEventId: eventModel.id,
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
