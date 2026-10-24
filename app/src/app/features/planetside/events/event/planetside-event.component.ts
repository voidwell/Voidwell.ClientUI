import { ChangeDetectorRef, Component, computed, forwardRef, inject, effect, input, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { NavLink } from '@shared/ui/nav-link.model';
import { Breadcrumb, BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { CombatEventHeaderComponent, FactionScores } from '../../components/combat-event/combat-event-header.component';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

@Component({
    templateUrl: './planetside-event.component.html',
    providers: [{ provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideEventComponent) }],
    imports: [LoaderComponent, ErrorCardComponent, BreadcrumbsComponent, CombatEventHeaderComponent, RouterOutlet, ZoneNamePipe, WorldNamePipe]
})

export class PlanetsideEventComponent extends PlanetsideCombatEventComponent<CustomEventDetails> {
    private customEventRepository = inject(CustomEventRepository);
    private cdr = inject(ChangeDetectorRef);
    readonly eventId = input<string>();

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
    readonly end = computed(() => new Date(this.event()?.endDate ?? 0));

    /** Territory held by each faction at the end of the event; `null` when it was not recorded. */
    readonly scores = computed<FactionScores | null>(() => {
        const score = this.event()?.score;
        return score ? { vs: score[1] ?? 0, nc: score[2] ?? 0, tr: score[3] ?? 0 } : null;
    });

    readonly breadcrumbs = computed<Breadcrumb[]>(() => [
        { label: 'Events', link: '/ps2/events' },
        { label: this.event()?.name ?? 'Event' }
    ]);

    constructor() {
        super();

        effect(() => {
            const eventId = this.eventId();

            untracked(() => {

                this.isLoading = true;
                this.errorMessage = null;

                this.event.set(null);

                this.customEventRepository.getEvent(eventId)
                    .pipe(catchError(error => {
                        this.errorMessage = getErrorMessage(error)
                        this.isLoading = false;
                        this.cdr.markForCheck();
                        return throwError(() => error);
                    }))
                    .subscribe(data => {
                        this.event.set(data);
                        this.isLoading = false;
                        this.cdr.markForCheck();
                    });
            });
        });
    }
}
