import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ZoneService } from '../shared/services/zone-service.service';

@Component({
    templateUrl: './map-explorer.template.html'
})

export class PlanetsideMapExplorerComponent implements OnDestroy {
    private routeSub: Subscription;
    navLinks = [];

    zones: any;

    playableZones: number[];

    constructor(private zoneService: ZoneService) {
        this.zoneService.Zones.subscribe(zones => {
            if (!zones) {
                return;
            }

            this.zones = zones;

            this.playableZones = this.zones.map(z => z.id);

            for (let idx in zones) {
                let zoneId = zones[idx].id;

                if (zoneId === 14 || zoneId > 90) {
                    continue;
                }

                this.navLinks.push({
                    path: zoneId,
                    display: zones[idx].name
                });
            }
        });
    }

    ngOnDestroy() {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }
}