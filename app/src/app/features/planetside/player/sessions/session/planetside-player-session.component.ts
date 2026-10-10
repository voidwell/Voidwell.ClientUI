import { ChangeDetectorRef, Component, OnDestroy, inject, effect, untracked, input } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { RouterLink } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsidePlayerComponent } from '../../planetside-player.component';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CharacterDetails, PlayerSessionEvent, PlayerSessionInfo } from '@core/api/models/ps2/character.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatCard, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { ZoneNamePipe } from '../../../pipes/zone-name.pipe';
import { SessionDataSource } from './planetside-player-session.data-source';

/** Running totals of a play session. */
interface SessionStats {
    kills: number;
    deaths: number;
    teamkills: number;
    suicides: number;
    headshots: number;
    facilitiesCaptured: number;
    facilitiesDefended: number;
}

@Component({
    templateUrl: './planetside-player-session.component.html',
    styleUrls: ['./planetside-player-session.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatCard, MatCardTitle, MatCardContent, MatCardFooter, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIcon, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DecimalPipe, DatePipe, DgcImageUrlPipe, FactionColorPipe, ZoneNamePipe]
})

export class PlanetsidePlayerSessionComponent implements OnDestroy {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);
    private characterRepository = inject(CharacterRepository);
    private cdr = inject(ChangeDetectorRef);

    isLoading: boolean;
    errorMessage: string = null;

    private loadSub: Subscription | undefined;
    readonly id = input<string>();
    private session: PlayerSessionInfo | null;
    private sessionStats: SessionStats;
    private playerData: CharacterDetails;

    private dataSource: DataSource<PlayerSessionEvent>;

    constructor() {
        this.isLoading = true;

        effect(() => {
            const player = this.planetsidePlayer.playerData();
            const sessionId = this.id();

            untracked(() => this.load(player, sessionId));
        });
    }

    private load(player: CharacterDetails | null, sessionId: string | undefined) {
        this.loadSub?.unsubscribe();

        this.isLoading = true;
        this.errorMessage = null;
        this.session = null;
        this.playerData = player;
        this.sessionStats = {
            kills: 0,
            deaths: 0,
            teamkills: 0,
            suicides: 0,
            headshots: 0,
            facilitiesCaptured: 0,
            facilitiesDefended: 0
        };

        if (player === null || sessionId === undefined) {
            return;
        }

        this.loadSub = this.characterRepository.getSession(player.id, sessionId)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }))
            .subscribe(data => {
                this.session = data.session;
                this.calculateSessionStats(data.events);
                this.dataSource = new SessionDataSource(data.events);
            });
    }

    private calculateSessionStats(events: PlayerSessionEvent[]) {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

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
        this.loadSub?.unsubscribe();
    }
}

