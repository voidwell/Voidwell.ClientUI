import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { CharacterDetails, PlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { PlanetsidePlayerComponent } from '../../planetside-player.component';
import { playerTrail } from '../../player-breadcrumbs';
import { formatDuration } from '../session-events';

/** Sessions the API returns per page; a shorter page is the last one. */
const PAGE_SIZE = 25;

interface MonthGroup {
    month: string;
    totalDuration: number;
    sessions: PlayerSessionSummary[];
}

@Component({
    templateUrl: './planetside-player-sessions-list.component.html',
    styleUrls: ['./planetside-player-sessions-list.component.css'],
    imports: [LoaderComponent, ErrorCardComponent, MatCard, MatCardContent, MatButton, MatIcon, RouterLink, DatePipe]
})
export class PlanetsidePlayerSessionsListComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);
    private characterRepository = inject(CharacterRepository);

    readonly formatDuration = formatDuration;

    /** Sessions loaded so far, newest first; `undefined` until the first page arrives. */
    readonly sessions = signal<PlayerSessionSummary[] | undefined>(undefined);
    readonly errorMessage = signal<string | null>(null);
    readonly loadingMore = signal(false);
    readonly hasMore = signal(false);

    private player: CharacterDetails | null = null;
    private page = 0;
    private loadSub?: Subscription;

    readonly summary = computed(() => {
        const sessions = this.sessions() ?? [];
        const total = sessions.reduce((sum, session) => sum + session.duration, 0);
        return {
            count: sessions.length,
            total,
            average: sessions.length ? total / sessions.length : 0,
            longest: Math.max(0, ...sessions.map(session => session.duration)),
            lastPlayed: sessions[0]?.loginDate
        };
    });

    /** Sessions by the month they started in, newest first. */
    readonly months = computed<MonthGroup[]>(() => {
        const groups: MonthGroup[] = [];
        for (const session of this.sessions() ?? []) {
            const date = new Date(session.loginDate);
            const month = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
            let group = groups[groups.length - 1];
            if (group?.month !== month) {
                group = { month, totalDuration: 0, sessions: [] };
                groups.push(group);
            }
            group.sessions.push(session);
            group.totalDuration += session.duration;
        }
        return groups;
    });

    constructor() {
        this.planetsidePlayer.breadcrumbs.set(playerTrail({ label: 'Sessions' }));

        effect(() => {
            const player = this.planetsidePlayer.playerData();
            untracked(() => this.reset(player));
        });
        inject(DestroyRef).onDestroy(() => this.loadSub?.unsubscribe());
    }

    loadMore(): void {
        this.page++;
        this.loadPage();
    }

    private reset(player: CharacterDetails | null): void {
        this.loadSub?.unsubscribe();
        this.player = player;
        this.page = 0;
        this.sessions.set(undefined);
        this.errorMessage.set(null);
        this.hasMore.set(false);

        if (player) {
            this.loadPage();
        }
    }

    private loadPage(): void {
        this.loadingMore.set(this.page > 0);
        this.loadSub = this.characterRepository.getSessions(this.player.id, this.page).subscribe({
            next: page => {
                const sorted = [...page].sort((a, b) => (a.loginDate < b.loginDate ? 1 : a.loginDate > b.loginDate ? -1 : 0));
                this.sessions.update(sessions => [...(sessions ?? []), ...sorted]);
                this.hasMore.set(page.length >= PAGE_SIZE);
                this.loadingMore.set(false);
            },
            error: error => {
                // A failed first page fails the page; a failed later page only stops paging
                if (this.page === 0) {
                    this.errorMessage.set(getErrorMessage(error));
                } else {
                    this.page--;
                }
                this.loadingMore.set(false);
            }
        });
    }
}
