import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { PlanetsideWorldComponent } from './../../planetside-world.component';
import { PlanetsideWorldMapComponent } from './../planetside-world-map.component';
import { ZoneHelper } from './../../../../zone-helper.service';

@Component({
    templateUrl: './planetside-world-zone.template.html',
    styleUrls: ['./planetside-world-zone.styles.css']
})

export class PlanetsideWorldZoneComponent implements OnDestroy {
    private routeSub: Subscription;

    public zoneId: number;

    zoneLogs: any[];
    score: [0, 0, 0, 0];

    ownershipSub: BehaviorSubject<any> = new BehaviorSubject(null);
    captureSub: Observable<any>;
    defendSub: Observable<any>;
    focusFacilityEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor(private route: ActivatedRoute, private parent: PlanetsideWorldMapComponent, private zoneHelper: ZoneHelper) {
        this.captureSub = this.parent.onFacilityCapture.asObservable();
        this.defendSub = this.parent.onFacilityDefend.asObservable();

        this.routeSub = this.route.params.subscribe(params => {
            if (!params['zoneId']) {
                return;
            }

            this.zoneId = parseInt(params['zoneId']);

            this.zoneLogs = parent.zoneLogs[this.zoneId];

            this.parent.getZoneOwnership(this.zoneId)
                .subscribe(data => {
                    this.ownershipSub.next(data);
                });
        });
    }

    getFacilityName(facilityId: number): string {
        return this.zoneHelper.getFacilityName(this.zoneId, facilityId);
    }

    focusFacility(facilityId: string) {
        this.focusFacilityEmitter.emit(facilityId);
    }

    onScoreChange(newScore) {
        this.score = newScore;
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}