import { ChangeDetectorRef, Component, computed, forwardRef, inject, effect, input, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { getErrorMessage } from '@core/util/error-message';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { NavLink } from '@shared/ui/nav-link.model';
import { Breadcrumb, BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { DEFAULT_ALERT_MINUTES } from '../../components/alert-view';
import { CombatEventHeaderComponent, FactionScores } from '../../components/combat-event/combat-event-header.component';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

@Component({
    templateUrl: './planetside-alert.component.html',
    providers: [{ provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideAlertComponent) }],
    imports: [LoaderComponent, ErrorCardComponent, BreadcrumbsComponent, CombatEventHeaderComponent, RouterOutlet, ZoneNamePipe, WorldNamePipe]
})

export class PlanetsideAlertComponent extends PlanetsideCombatEventComponent<AlertResult> {
    private alertRepository = inject(AlertRepository);
    private cdr = inject(ChangeDetectorRef);
    readonly worldId = input<string>();
    readonly instanceId = input<string>();

    isLoading: boolean = true;
    errorMessage: string = null;

    readonly tabs: NavLink[] = [
        { path: 'players', display: 'Players' },
        { path: 'outfits', display: 'Outfits' },
        { path: 'weapons', display: 'Weapons' },
        { path: 'vehicles', display: 'Vehicles' },
        { path: 'map', display: 'Map' }
    ];

    readonly start = computed(() => new Date(this.event()?.startDate ?? 0));

    /** When the alert ended, or is due to end. */
    readonly end = computed(() => {
        const alert = this.event();
        return alert?.endDate ? new Date(alert.endDate) : new Date(this.start().getTime() + DEFAULT_ALERT_MINUTES * 60000);
    });

    readonly scores = computed<FactionScores | null>(() => {
        const alert = this.event();
        return alert ? { vs: alert.lastFactionVS, nc: alert.lastFactionNC, tr: alert.lastFactionTR } : null;
    });

    readonly startScores = computed<FactionScores | null>(() => {
        const alert = this.event();
        return alert ? { vs: alert.startFactionVS, nc: alert.startFactionNC, tr: alert.startFactionTR } : null;
    });

    readonly breadcrumbs = computed<Breadcrumb[]>(() => [
        { label: 'Alerts', link: '/ps2/alerts' },
        { label: this.event()?.metagameEvent?.name ?? 'Alert' }
    ]);

    constructor() {
        super();
        effect(() => {
            const worldId = this.worldId();
            const instanceId = this.instanceId();

            untracked(() => {

                this.isLoading = true;
                this.errorMessage = null;

                this.event.set(null);

                this.alertRepository.getAlert(worldId, instanceId)
                    .pipe(catchError(error => {
                        this.errorMessage = getErrorMessage(error)
                        return throwError(() => error);
                    }))
                    .pipe(finalize(() => {
                        this.isLoading = false;
                        this.cdr.markForCheck();
                    }))
                    .subscribe(data => {
                        this.event.set(data);
                    });
            });
        });
    }
}
