import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { ZoneService } from '../data/zone.service';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';

/** The continents to pick from above a map that can be played with: a click gives a facility to the next faction. */
@Component({
    templateUrl: './map-explorer.component.html',
    styleUrls: ['./map-explorer.component.css'],
    imports: [ChipsComponent, MatCard, MatCardTitle, MatCardContent, RouterOutlet]
})

export class PlanetsideMapExplorerComponent {
    private readonly navLinks = inject(ZoneService).zoneNavLinks;
    readonly continents = computed<ChipOption<string>[]>(() => this.navLinks().map(link => ({ value: link.path, label: link.display, link: link.path })));
}
