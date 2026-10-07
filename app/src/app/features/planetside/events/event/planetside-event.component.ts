import { Component, forwardRef, inject, effect, input, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { FactionBarComponent } from '../../components/faction-bar/faction-bar.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { DatePipe } from '@angular/common';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

@Component({
    templateUrl: './planetside-event.component.html',
    styleUrls: ['./planetside-event.component.css'],
    providers: [{ provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideEventComponent) }],
    imports: [LoaderComponent, ErrorMessageComponent, MatCard, MatCardContent, VWCountdownComponent, FactionBarComponent, MatCardFooter, VWTabNavSubBarComponent, RouterOutlet, DatePipe, ZoneNamePipe, WorldNamePipe]
})

export class PlanetsideEventComponent extends PlanetsideCombatEventComponent<CustomEventDetails> {
    private customEventRepository = inject(CustomEventRepository);
    readonly eventId = input<string>();

    isLoading: boolean = true;
    errorMessage: string = null;
    private navLinks = [
        { path: 'players', display: 'Players' },
        { path: 'outfits', display: 'Outfits' },
        { path: 'weapons', display: 'Weapons' },
        { path: 'vehicles', display: 'Vehicles' },
        { path: 'map', display: 'Map' }
    ];

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
                        return throwError(() => error);
                    }))
                    .subscribe(data => this.setup(data));
            });
        });
    }

    private setup(data: CustomEventDetails) {
        this.event.set(data);
        this.isLoading = false;
    }

    private getEndDate(alert: { startDate?: string }): Date {
        const startString = alert.startDate;
        const startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    }

}