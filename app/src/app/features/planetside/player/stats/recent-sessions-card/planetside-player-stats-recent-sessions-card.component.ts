import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { CharacterDetails, LatestPlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';

export interface RecentSessionRow extends LatestPlayerSessionSummary {
    kdr: number;
}

@Component({
    selector: 'planetside-player-stats-recent-sessions-card',
    templateUrl: './planetside-player-stats-recent-sessions-card.component.html',
    styleUrls: ['./planetside-player-stats-recent-sessions-card.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, RouterLink, DatePipe, DecimalPipe]
})

export class PlanetsidePlayerStatsRecentSessionsCardComponent {
    private characterRepository = inject(CharacterRepository);

    readonly player = input.required<CharacterDetails>();

    /** The player's latest sessions with their kills and K/D, `undefined` while they load. */
    readonly sessions = toSignal(toObservable(this.player).pipe(
        switchMap(player => this.characterRepository.getLatestSessions(player.id).pipe(
            map((sessions): RecentSessionRow[] => [...sessions]
                .sort((a, b) => (a.loginDate < b.loginDate ? 1 : a.loginDate > b.loginDate ? -1 : 0))
                .map(session => ({ ...session, kdr: session.deaths > 0 ? session.kills / session.deaths : session.kills }))),
            catchError(() => of([] as RecentSessionRow[])),
            startWith(undefined as RecentSessionRow[] | undefined)))));
}
