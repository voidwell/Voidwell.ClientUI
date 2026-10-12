import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { forkJoin, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { CharacterDetails, PlayerSession, PlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';

const ROW_COUNT = 5;

export interface RecentSessionRow extends PlayerSessionSummary {
    /** `null` when the session's events could not be loaded. */
    kills: number | null;
    deaths: number | null;
    /** Kills per death, or the kill count when there were no deaths. `null` when unknown. */
    kdr: number | null;
}

/** Counts a player's kills (of other factions) and deaths, the same way the session page does. */
function countKillsAndDeaths(session: PlayerSession | null, playerId: string): { kills: number; deaths: number } | null {
    if (!session?.events) {
        return null;
    }

    let kills = 0;
    let deaths = 0;

    for (const event of session.events) {
        if (event.eventType !== 'Death') {
            continue;
        }

        if (event.attacker?.id === playerId && event.attacker.id !== event.victim?.id && event.attacker.factionId !== event.victim?.factionId) {
            kills++;
        }

        if (event.victim?.id === playerId) {
            deaths++;
        }
    }

    return { kills, deaths };
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
        switchMap(player => this.characterRepository.getSessions(player.id).pipe(
            map(sessions => [...sessions]
                .sort((a, b) => (a.loginDate < b.loginDate ? 1 : a.loginDate > b.loginDate ? -1 : 0))
                .slice(0, ROW_COUNT)),
            switchMap(sessions => sessions.length === 0
                ? of([] as RecentSessionRow[])
                : forkJoin(sessions.map(session => this.characterRepository.getSession(player.id, session.id).pipe(
                    catchError(() => of(null)),
                    map((detail): RecentSessionRow => {
                        const totals = countKillsAndDeaths(detail, player.id);
                        return {
                            ...session,
                            kills: totals?.kills ?? null,
                            deaths: totals?.deaths ?? null,
                            kdr: totals ? (totals.deaths > 0 ? totals.kills / totals.deaths : totals.kills) : null
                        };
                    }))))),
            catchError(() => of([] as RecentSessionRow[])),
            startWith(undefined as RecentSessionRow[] | undefined)))));
}
