import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { combineLatest, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { CharacterDetails, PlayerSession } from '@core/api/models/ps2/character.model';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { PlanetsidePlayerComponent } from '../../planetside-player.component';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { ZoneNamePipe } from '../../../pipes/zone-name.pipe';
import {
    SessionEventFilter, SessionEventKind, SessionLogEntry, activityBuckets, formatDuration, matchesFilter, sessionStats, toLogEntry, weaponUsage, zonesVisited
} from '../session-events';

type SessionResult = { session: PlayerSession, playerId: string } | { error: string };

/** Activity chart columns: one per five minutes, within these bounds. */
const BUCKET_MS = 5 * 60 * 1000;
const MIN_BUCKETS = 6;
const MAX_BUCKETS = 48;

@Component({
    templateUrl: './planetside-player-session.component.html',
    styleUrls: ['./planetside-player-session.component.css'],
    imports: [
        LoaderComponent,
        ErrorCardComponent,
        MatCard,
        MatCardTitle,
        MatCardContent,
        MatButtonToggleGroup,
        MatButtonToggle,
        MatIcon,
        RouterLink,
        NgClass,
        NgTemplateOutlet,
        DatePipe,
        DecimalPipe,
        DgcImageUrlPipe,
        FactionColorPipe,
        ZoneNamePipe
    ]
})
export class PlanetsidePlayerSessionComponent {
    private characterRepository = inject(CharacterRepository);

    readonly id = input<string>();
    readonly formatDuration = formatDuration;

    readonly icons: Record<SessionEventKind, string> = {
        kill: 'mdi-crosshairs-gps',
        teamkill: 'mdi-account-alert',
        suicide: 'mdi-skull-outline',
        death: 'mdi-skull',
        vehicleKill: 'mdi-tank',
        vehicleLoss: 'mdi-car-off',
        capture: 'mdi-flag',
        defend: 'mdi-shield',
        rankUp: 'mdi-arrow-up-bold',
        login: 'mdi-login',
        logout: 'mdi-logout'
    };

    private readonly result = toSignal(combineLatest([toObservable(inject(PlanetsidePlayerComponent).playerData), toObservable(this.id)]).pipe(
        filter((args): args is [CharacterDetails, string] => !!args[0] && !!args[1]),
        switchMap(([player, sessionId]) => this.characterRepository.getSession(player.id, sessionId).pipe(
            map((session): SessionResult => ({ session, playerId: player.id })),
            catchError(error => of<SessionResult>({ error: getErrorMessage(error) })),
            startWith(undefined)))));

    readonly playerId = computed(() => {
        const result = this.result();
        return result && 'session' in result ? result.playerId : undefined;
    });

    readonly errorMessage = computed(() => {
        const result = this.result();
        return result && 'error' in result ? result.error : null;
    });

    /** The session's details; `undefined` while loading. */
    readonly session = computed(() => {
        const result = this.result();
        return result && 'session' in result ? result.session.session : undefined;
    });

    readonly entries = computed<SessionLogEntry[]>(() => {
        const result = this.result();
        return result && 'session' in result
            ? (result.session.events ?? []).map(event => toLogEntry(event, result.playerId))
            : [];
    });

    readonly stats = computed(() => sessionStats(this.entries()));
    readonly weapons = computed(() => weaponUsage(this.entries()).slice(0, 5));
    readonly zones = computed(() => {
        const result = this.result();
        return result && 'session' in result ? zonesVisited(result.session.events ?? []) : [];
    });

    readonly activity = computed(() => {
        const session = this.session();
        if (!session) {
            return { buckets: [], max: 0 };
        }
        const start = Date.parse(session.loginDate);
        const end = start + session.duration;
        const count = Math.min(MAX_BUCKETS, Math.max(MIN_BUCKETS, Math.round(session.duration / BUCKET_MS)));
        const buckets = activityBuckets(this.entries(), start, end, count);
        return { buckets, max: Math.max(1, ...buckets.map(bucket => Math.max(bucket.kills, bucket.deaths))) };
    });

    readonly logFilter = signal<SessionEventFilter>('all');
    readonly log = computed(() => this.entries().filter(entry => matchesFilter(entry, this.logFilter())));
    readonly filterCounts = computed(() => {
        const entries = this.entries();
        const count = (logFilter: SessionEventFilter) => entries.filter(entry => matchesFilter(entry, logFilter)).length;
        return { all: entries.length, combat: count('combat'), vehicles: count('vehicles'), facilities: count('facilities') };
    });
}
