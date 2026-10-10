import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AlertView } from './alert-view';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { MatCard, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { FactionBarComponent } from '../faction-bar/faction-bar.component';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'vw-alert-card',
    templateUrl: './alert-card.component.html',
    styleUrls: ['./alert-card.component.css'],
    imports: [NgClass, MatCard, MatCardTitle, VWCountdownComponent, MatCardSubtitle, FactionBarComponent, MatButton, RouterLink, DecimalPipe, DatePipe, ZoneNamePipe, WorldNamePipe]
})

export class AlertCardComponent {
    @Input() alert: AlertView;
    @Input() focusEvent: boolean;

    defaultAlertLengthMinutes = 45;

    isAlertActive(): boolean {
        return this.getEndDate() > new Date();
    }

    getEndDate(): Date {
        if (this.alert.endDate) {
            return new Date(this.alert.endDate);
        }

        const startString = this.alert.startDate;
        const startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * this.defaultAlertLengthMinutes);
    }

    isNeuturalMetagame(alert: Pick<AlertView, 'metagameEvent'>): boolean {
        if (!alert || !alert.metagameEvent) {
            return true;
        }

        const type = alert.metagameEvent.type;
        return type === 1 || type === 8 || type === 9;
    }
}