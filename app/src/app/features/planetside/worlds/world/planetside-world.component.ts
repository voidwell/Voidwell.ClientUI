import { Component, ChangeDetectionStrategy, inject, signal, effect, input, untracked, numberAttribute, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { WorldNamePipe } from '../../pipes';
import { mergeMapTo } from 'rxjs/operators';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { WorldOnlineState } from '@core/api/models/ps2/world-state.model';
import { WorldActivity } from '@core/api/models/ps2/world.model';
import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { AlertView, toAlertView } from '../../components/alert-card/alert-view';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatCard, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';
import { WorldNamePipe as WorldNamePipe_1 } from '../../pipes/world-name.pipe';

type FactionKey = 'vs' | 'nc' | 'tr' | 'ns';
const FACTION_KEYS: FactionKey[] = ['vs', 'nc', 'tr', 'ns'];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-world.component.html',
    styleUrls: ['./planetside-world.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatIcon, MatCardContent, RouterLink, NgClass, MatCardFooter, VWTabNavSubBarComponent, RouterOutlet, DecimalPipe, DatePipe, FactionColorPipe, WorldNamePipe_1]
})

export class PlanetsideWorldComponent implements OnDestroy {
    readonly worldId = input.required<number, string>({ transform: numberAttribute });
    private worldStateRepository = inject(WorldStateRepository);
    private worldRepository = inject(WorldRepository);
    private alertRepository = inject(AlertRepository);
    private worldName = inject(WorldNamePipe);

    private worldSub: Subscription;
    private activitySub: Subscription;
    private alertsSub: Subscription;

    isLoading: boolean = false;
    world: WorldOnlineState;
    zoneTotal: Record<FactionKey, number> = { vs: 0, nc: 0, tr: 0, ns: 0 };

    readonly activity = signal<WorldActivity | null>(null);
    readonly alerts = signal<AlertView[] | null>(null);

    navLinks = [
        { path: 'activity', display: 'Activity', icon: 'mdi-radar' },
        { path: 'players', display: 'Online players', icon: 'mdi-account-multiple' },
        { path: 'map', display: 'Map', icon: 'mdi-map' }
    ];

    constructor() {

        effect(() => {
            const worldId = this.worldId();

            untracked(() => {
                if (!worldId) {
                    return;
                }

                this.isLoading = true;
                if (this.worldSub) this.worldSub.unsubscribe();
                if (this.activitySub) this.activitySub.unsubscribe();
                if (this.alertsSub) this.alertsSub.unsubscribe();

                this.activity.set(null);
                this.alerts.set(null);

                this.worldSub = timer(0, 60000)
                    .pipe(mergeMapTo(this.worldStateRepository.getWorldState(worldId)))
                    .subscribe((worldState) => {
                        this.world = worldState;

                        FACTION_KEYS.forEach((f) => {
                            this.zoneTotal[f] = 0;
                        });

                        worldState.zoneStates.forEach((zoneState) => {
                            FACTION_KEYS.forEach((f) => {
                                this.zoneTotal[f] += zoneState.population?.[f] ?? 0;
                            });
                        });

                        this.isLoading = false;
                    });
            
                this.activitySub = timer(0, 60000)
                    .pipe(mergeMapTo(this.worldRepository.getWorldActivity(worldId, 1)))
                    .subscribe((activity) => {
                        this.activity.set(activity);
                    });

                this.alertsSub = timer(0, 60000)
                    .pipe(mergeMapTo(this.alertRepository.getAlerts(0, worldId)))
                    .subscribe((alerts) => {
                        const now = new Date();

                        const activeAlerts = alerts
                            .map(toAlertView)
                            .filter(alert => alert.endDate !== null && alert.endDate > now);

                        this.alerts.set(activeAlerts);
                    });
            });
        });
    }

    getOnlinePlayers(): Observable<OnlineCharacter[]> {
        return this.worldStateRepository.getOnlinePlayers(this.worldId());
    }

    getMinutes(value: string | Date): number {
        const now = new Date();
        const valueDate = new Date(value);
        const diffMs = (now.getTime() - valueDate.getTime());
        return Math.round((diffMs / 1000) / 60);
    }

    ngOnDestroy() {
        if (this.worldSub) this.worldSub.unsubscribe();
        if (this.activitySub) this.activitySub.unsubscribe();
        if (this.alertsSub) this.alertsSub.unsubscribe();
    }
}