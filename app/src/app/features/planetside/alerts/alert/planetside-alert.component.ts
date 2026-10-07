import { Component, forwardRef, inject, effect, input, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { getErrorMessage } from '@core/util/error-message';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { MatIcon } from '@angular/material/icon';
import { FactionBarComponent } from '../../components/faction-bar/faction-bar.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

@Component({
    templateUrl: './planetside-alert.component.html',
    styleUrls: ['./planetside-alert.component.css'],
    providers: [{ provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideAlertComponent) }],
    imports: [LoaderComponent, ErrorMessageComponent, NgClass, MatCard, MatCardTitle, VWCountdownComponent, MatIcon, MatCardSubtitle, MatCardContent, FactionBarComponent, VWTabNavSubBarComponent, RouterOutlet, DecimalPipe, DatePipe, ZoneNamePipe, WorldNamePipe]
})

export class PlanetsideAlertComponent extends PlanetsideCombatEventComponent<AlertResult> {
    private alertRepository = inject(AlertRepository);
    readonly worldId = input<string>();
    readonly instanceId = input<string>();

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
                    }))
                    .subscribe(data => {
                        this.event.set(data);
                    });
            });
        });
    }

    private getDurationMinutes(alert: Pick<AlertResult, 'startDate' | 'endDate'>): number {
        return (this.getEndDate(alert).getTime() - new Date(alert.startDate).getTime()) / 60000;
    }

    private getEndDate(alert: Pick<AlertResult, 'startDate' | 'endDate'>): Date {
        if (alert.endDate) {
            return new Date(alert.endDate);
        }

        const startString = alert.startDate;
        const startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 45);
    }

    private isActive(alert: Pick<AlertResult, 'startDate' | 'endDate'>): boolean {
        const endDate = this.getEndDate(alert);
        return endDate > new Date();
    }

    private isNeuturalMetagame(alert: Pick<AlertResult, 'metagameEvent'>): boolean {
        if (!alert || !alert.metagameEvent) {
            return true;
        }

        const type = alert.metagameEvent.type;
        return type === 1 || type === 8 || type === 9;
    }

}