import { Component, EventEmitter, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { ZoneRegion } from '../../components/ps2-zone-map/models';
import { FacilityEvent, Ps2ZoneMapComponent } from '../../components/ps2-zone-map/ps2-zone-map.component';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { ZoneService } from '../../data/zone.service';
import { FactionBarComponent } from '../../components/faction-bar/faction-bar.component';

@Component({
    templateUrl: './map-simulator.component.html',
    styleUrls: ['./map-simulator.component.css'],
    imports: [Ps2ZoneMapComponent, MatCard, MatCardTitle, MatCardContent, FactionBarComponent]
})

export class PlanetsideMapSimulatorComponent {
    private zoneService = inject(ZoneService);

    readonly zoneId = input.required<number, string>({ transform: numberAttribute });
    readonly zoneName = computed(() => this.zoneService.zoneName(this.zoneId()) ?? '');
    /** Territory held, as a percentage each for neutral, VS, NC and TR (index 1 to 3 for the factions). */
    readonly score = signal<number[]>([0, 0, 0, 0]);
    readonly hideOverlay = signal(true);
    stateLog: { [facilityId: string]: number } = {};
    
    onFacilityCapture: EventEmitter<FacilityEvent> = new EventEmitter<FacilityEvent>();

    onScoreChange(newScore: number[]) {
        this.score.set(newScore);
    }

    onHexSelected(region: ZoneRegion) {
        const facilityId = region.facility.id;
        let factionId = region.faction + 1;
        if (factionId > 3) {
            factionId = 0;
        }

        this.sendCaptureEvent(facilityId, factionId);
    }

    sendCaptureEvent(facilityId: string, factionId: number) {
        const captureEvent: FacilityEvent = {
            facilityId: facilityId,
            factionId: factionId,
            zoneId: this.zoneId(),
            noFlash: true
        };

        this.stateLog[facilityId] = factionId;

        this.onFacilityCapture.emit(captureEvent);
    }

    onKeypress(e: KeyboardEvent) {
        switch(e.key) {
            case "q": {
                const commandList = Object.keys(this.stateLog).map(e => "/facility setfaction " + this.stateLog[e] + " " + e);
                console.log(commandList.join(";"));
            }
        }
    };

}