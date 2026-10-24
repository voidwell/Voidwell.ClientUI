import { Component, OnDestroy, computed, effect, inject, input, numberAttribute, signal, untracked } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatCard, MatCardFooter, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Observable, Subscription, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { WorldOnlineState } from '@core/api/models/ps2/world-state.model';
import { WorldActivity } from '@core/api/models/ps2/world.model';
import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { AlertView, toAlertView } from '../../components/alert-view';
import { AlertIndicatorComponent } from '../../components/alert-indicator/alert-indicator.component';
import { ZoneService } from '../../data/zone.service';
import { FactionCodePipe } from '../../pipes/faction-code.pipe';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';
import { FACTION_KEYS } from '../world-list-figures';
import { agoLabel, zoneTiles } from './world-figures';

@Component({
    templateUrl: './planetside-world.component.html',
    styleUrls: ['./planetside-world.component.css'],
    imports: [
        LoaderComponent, MatCard, MatCardTitle, MatCardFooter, MatIcon, RouterLink, RouterLinkActive, RouterOutlet, NgClass, DecimalPipe,
        VWTabNavSubBarComponent, BreadcrumbsComponent, AlertIndicatorComponent, FactionCodePipe, FactionColorPipe, WorldNamePipe
    ]
})
export class PlanetsideWorldComponent implements OnDestroy {
    readonly worldId = input.required<number, string>({ transform: numberAttribute });
    private worldStateRepository = inject(WorldStateRepository);
    private worldRepository = inject(WorldRepository);
    private alertRepository = inject(AlertRepository);
    private zoneService = inject(ZoneService);
    private worldName = inject(WorldNamePipe);

    private worldSub: Subscription;
    private activitySub: Subscription;
    private alertsSub: Subscription;

    readonly isLoading = signal(false);
    readonly world = signal<WorldOnlineState | null>(null);
    readonly activity = signal<WorldActivity | null>(null);
    readonly alerts = signal<AlertView[] | null>(null);

    readonly factionKeys = FACTION_KEYS;
    readonly agoLabel = agoLabel;

    /** A tile per zone the server reports; refreshed with the server's state. */
    readonly tiles = computed(() => zoneTiles(this.world(), id => this.zoneService.zoneName(id)));

    readonly breadcrumbs = computed(() => [
        { label: 'Servers', link: '/ps2/worlds' },
        { label: this.world()?.name ?? this.worldName.transform(this.worldId()) ?? '' }
    ]);

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

                this.isLoading.set(true);
                this.worldSub?.unsubscribe();
                this.activitySub?.unsubscribe();
                this.alertsSub?.unsubscribe();

                this.world.set(null);
                this.activity.set(null);
                this.alerts.set(null);

                this.worldSub = timer(0, 60000)
                    .pipe(mergeMap(() => this.worldStateRepository.getWorldState(worldId)))
                    .subscribe(worldState => {
                        this.world.set(worldState);
                        this.isLoading.set(false);
                    });

                this.activitySub = timer(0, 60000)
                    .pipe(mergeMap(() => this.worldRepository.getWorldActivity(worldId, 1)))
                    .subscribe(activity => this.activity.set(activity));

                this.alertsSub = timer(0, 60000)
                    .pipe(mergeMap(() => this.alertRepository.getAlerts(0, worldId)))
                    .subscribe(alerts => {
                        const now = new Date();

                        this.alerts.set(alerts
                            .map(toAlertView)
                            .filter(alert => alert.endDate !== null && alert.endDate > now));
                    });
            });
        });
    }

    getOnlinePlayers(): Observable<OnlineCharacter[]> {
        return this.worldStateRepository.getOnlinePlayers(this.worldId());
    }

    ngOnDestroy() {
        this.worldSub?.unsubscribe();
        this.activitySub?.unsubscribe();
        this.alertsSub?.unsubscribe();
    }
}
