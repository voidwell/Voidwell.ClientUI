import { Component, computed, input } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { ZoneImageComponent } from '../zone-image/zone-image.component';
import { AlertView } from '../alert-view';
import { AlertIndicatorComponent } from '../alert-indicator/alert-indicator.component';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';
import { FactionNamePipe } from '../../pipes/faction-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';

/**
 * The alerts running now, the oldest first, each with the continent, the factions' scores in their colours and the time left. Without alerts the card
 * is left out, or says `emptyText` when there is one. `showServer` names each alert's server.
 */
@Component({
    selector: 'active-alerts-card',
    templateUrl: './active-alerts-card.component.html',
    styleUrls: ['./active-alerts-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, NgClass, DecimalPipe, VWCountdownComponent, AlertIndicatorComponent, ZoneImageComponent, FactionColorPipe, FactionNamePipe, WorldNamePipe, ZoneNamePipe]
})
export class ActiveAlertsCardComponent {
    readonly alerts = input<AlertView[]>([]);
    readonly showServer = input(false);
    readonly emptyText = input('');

    readonly sorted = computed(() => [...this.alerts()].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
}
