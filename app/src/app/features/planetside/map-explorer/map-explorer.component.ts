import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { ZoneService } from '../data/zone.service';

@Component({
    templateUrl: './map-explorer.component.html',
    imports: [VWTabNavSubBarComponent, RouterOutlet]
})

export class PlanetsideMapExplorerComponent {
    readonly navLinks = inject(ZoneService).zoneNavLinks;
}
