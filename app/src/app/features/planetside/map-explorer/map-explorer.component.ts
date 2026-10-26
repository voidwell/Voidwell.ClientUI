import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { ZoneService } from '../data/zone.service';

/** The continents to pick from above a map that can be played with: a click gives a facility to the next faction. */
@Component({
    templateUrl: './map-explorer.component.html',
    styleUrls: ['./map-explorer.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, RouterLinkActive, RouterOutlet]
})

export class PlanetsideMapExplorerComponent {
    readonly navLinks = inject(ZoneService).zoneNavLinks;
}
