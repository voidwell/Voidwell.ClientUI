import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

/** The events running now, the oldest first, with the teams and the time left. Without events it says so. */
@Component({
    selector: 'active-events-card',
    templateUrl: './active-events-card.component.html',
    styleUrls: ['./active-events-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, VWCountdownComponent, ZoneNamePipe, WorldNamePipe]
})
export class ActiveEventsCardComponent {
    readonly events = input<CustomEvent[]>([]);

    readonly sorted = computed(() => [...this.events()]
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map(event => ({
            event,
            end: new Date(event.endDate),
            teams: [...(event.teams ?? [])].sort((a, b) => a.teamId.localeCompare(b.teamId))
        })));
}
