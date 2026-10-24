import { Component, computed, input } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { AlertView } from '../../../../components/alert-card/alert-view';
import { AlertIndicatorComponent } from '../../../../components/alert-indicator/alert-indicator.component';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { FactionNamePipe } from '../../../../pipes/faction-name.pipe';
import { ZoneNamePipe } from '../../../../pipes/zone-name.pipe';

/** The alerts running on the server, the oldest first, each with the factions' scores in their colours. */
@Component({
    selector: 'activity-alerts-card',
    templateUrl: './activity-alerts-card.component.html',
    styleUrls: ['./activity-alerts-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, NgClass, DecimalPipe, VWCountdownComponent, AlertIndicatorComponent, FactionColorPipe, FactionNamePipe, ZoneNamePipe]
})
export class ActivityAlertsCardComponent {
    readonly alerts = input<AlertView[]>([]);

    readonly sorted = computed(() => [...this.alerts()].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
}
