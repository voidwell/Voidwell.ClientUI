import { Component, ChangeDetectionStrategy, EventEmitter, inject, signal, effect, input, numberAttribute, untracked } from '@angular/core';
import { Observable } from 'rxjs';
import { PlanetsideWorldMapComponent } from '../planetside-world-map.component';
import { ZoneHelper } from '../../../../data/zone-helper.service';
import { ZoneRegionOwnership } from '@core/api/models/ps2/map.model';
import { FacilityEvent, Ps2ZoneMapComponent } from '../../../../components/ps2-zone-map/ps2-zone-map.component';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { FactionBarComponent } from '../../../../components/faction-bar/faction-bar.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-world-zone.component.html',
    styleUrls: ['./planetside-world-zone.component.css'],
    imports: [Ps2ZoneMapComponent, MatCard, MatCardContent, FactionBarComponent, MatCardFooter, MatIcon, NgClass, DatePipe, FactionColorPipe]
})

export class PlanetsideWorldZoneComponent {
    private parent = inject(PlanetsideWorldMapComponent);
    private zoneHelper = inject(ZoneHelper);

    readonly zoneId = input.required<number, string>({ transform: numberAttribute });
    score: number[];

    readonly ownership = signal<ZoneRegionOwnership[] | null>(null);
    captureSub: Observable<FacilityEvent>;
    defendSub: Observable<FacilityEvent>;
    focusFacilityEmitter: EventEmitter<number | string> = new EventEmitter<number | string>();

    constructor() {
        this.captureSub = this.parent.onFacilityCapture.asObservable();
        this.defendSub = this.parent.onFacilityDefend.asObservable();

        effect(() => {
            const zoneId = this.zoneId();

            untracked(() => {
                this.parent.getZoneOwnership(zoneId)
                    .subscribe(data => {
                        this.ownership.set(data);
                    });
            });
        });
    }

    getZoneLogs() {
        return this.parent.zoneLogs[this.zoneId()] || [];
    }

    getFacilityName(facilityId: number | string): string {
        return this.zoneHelper.getFacilityName(this.zoneId(), facilityId);
    }

    focusFacility(facilityId: number | string) {
        this.focusFacilityEmitter.emit(facilityId);
    }

    onScoreChange(newScore: number[]) {
        this.score = newScore;
    }

}