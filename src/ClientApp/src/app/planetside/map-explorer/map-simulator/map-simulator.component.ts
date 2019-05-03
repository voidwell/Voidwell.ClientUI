import { Input, Component, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription, BehaviorSubject, interval} from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ZoneRegion } from '../../shared/ps2-zone-map/models';

@Component({
    templateUrl: './map-simulator.template.html',
    styleUrls: ['./map-simulator.styles.css']
})

export class PlanetsideMapSimulatorComponent implements OnInit, OnDestroy {
    private routeSub: Subscription;

    public zoneId: number;
    public score: [0, 0, 0, 0] = [0, 0, 0, 0];
    public hideOverlay = true;
    stateLog: { [facilityId: number]: number} = {};
    
    onFacilityCapture: EventEmitter<any> = new EventEmitter<any>();

    constructor(private route: ActivatedRoute, private changeDetector: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if (!params['zoneId']) {
                return;
            }

            this.zoneId = parseInt(params['zoneId']);
        });
    }

    onScoreChange(newScore) {
        this.score = newScore;
        this.changeDetector.detectChanges();
    }

    onHexSelected(region: ZoneRegion) {
        let facilityId = region.facility.id;
        let factionId = region.faction + 1;
        if (factionId > 3) {
            factionId = 0;
        }

        this.sendCaptureEvent(facilityId, factionId);
    }

    sendCaptureEvent(facilityId, factionId) {
        let captureEvent = {
            facilityId: facilityId,
            factionId: factionId,
            zoneId: this.zoneId,
            noFlash: true
        };

        this.stateLog[facilityId] = factionId;

        this.onFacilityCapture.emit(captureEvent);
    }

    onKeypress(e: KeyboardEvent) {
        switch(e.key) {
            case "q": {
                let commandList = Object.keys(this.stateLog).map(e => "/facility setfaction " + e + " " + this.stateLog[e]);
                console.log(commandList.join(";"));
            }
        }
    };

    ngOnDestroy() {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }
}