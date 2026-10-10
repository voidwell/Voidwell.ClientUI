import { Component, EventEmitter, ChangeDetectorRef, inject, input, numberAttribute } from '@angular/core';
import { ZoneRegion } from '../../components/ps2-zone-map/models';
import { FacilityEvent, Ps2ZoneMapComponent } from '../../components/ps2-zone-map/ps2-zone-map.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FactionBarComponent } from '../../components/faction-bar/faction-bar.component';

@Component({
    templateUrl: './map-simulator.component.html',
    styleUrls: ['./map-simulator.component.css'],
    imports: [Ps2ZoneMapComponent, MatButton, MatIcon, FactionBarComponent]
})

export class PlanetsideMapSimulatorComponent {
    private changeDetector = inject(ChangeDetectorRef);

    readonly zoneId = input.required<number, string>({ transform: numberAttribute });
    public score: number[] = [0, 0, 0, 0];
    public hideOverlay = true;
    stateLog: { [facilityId: string]: number } = {};
    
    onFacilityCapture: EventEmitter<FacilityEvent> = new EventEmitter<FacilityEvent>();

    onScoreChange(newScore: number[]) {
        this.score = newScore;
        this.changeDetector.detectChanges();
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