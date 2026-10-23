import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { WeaponLeaderboardRow } from '@core/api/models/ps2/weapon.model';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { GradedFigureComponent } from '../../components/graded-figure/graded-figure.component';
import { FactionIconComponent } from '../../components/faction-icon/faction-icon.component';
import { accuracy, kdr, kph } from '../leaderboard-figures';

const TOP = 10;

/** The weapon's top ten players by kills, linking on to the full leaderboard. Loads on its own, after the page. */
@Component({
    selector: 'item-top-players-card',
    templateUrl: './top-players-card.component.html',
    styleUrls: ['./top-players-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, DecimalPipe, PercentPipe, LoaderComponent, GradedFigureComponent, FactionIconComponent]
})
export class TopPlayersCardComponent {
    private leaderboardRepository = inject(LeaderboardRepository);

    readonly itemId = input.required<string>();

    readonly kdr = kdr;
    readonly accuracy = accuracy;
    readonly kph = kph;

    /** The top players; `undefined` while loading and `null` when the leaderboard could not be loaded. */
    readonly players = toSignal<WeaponLeaderboardRow[] | null | undefined>(toObservable(this.itemId).pipe(
        switchMap(id => this.leaderboardRepository.getWeaponLeaderboard(id).pipe(
            map(rows => rows.slice(0, TOP)),
            catchError(() => of(null)),
            startWith(undefined)))));
}
