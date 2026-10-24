import { Component, EventEmitter, computed, effect, inject, input, numberAttribute, signal, untracked } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { ZoneRegionOwnership } from '@core/api/models/ps2/map.model';
import { FacilityEvent, Ps2ZoneMapComponent } from '../../../../components/ps2-zone-map/ps2-zone-map.component';
import { FactionBarComponent } from '../../../../components/faction-bar/faction-bar.component';
import { ZoneHelper } from '../../../../data/zone-helper.service';
import { ZoneService } from '../../../../data/zone.service';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { PlanetsideWorldMapComponent } from '../planetside-world-map.component';

@Component({
    templateUrl: './planetside-world-zone.component.html',
    styleUrls: ['./planetside-world-zone.component.css'],
    imports: [Ps2ZoneMapComponent, MatCard, MatCardTitle, MatCardContent, FactionBarComponent, MatIcon, NgClass, DatePipe, FactionColorPipe]
})

export class PlanetsideWorldZoneComponent {
    private parent = inject(PlanetsideWorldMapComponent);
    private zoneHelper = inject(ZoneHelper);
    private zoneService = inject(ZoneService);

    readonly zoneId = input.required<number, string>({ transform: numberAttribute });
    readonly zoneName = computed(() => this.zoneService.zoneName(this.zoneId()) ?? '');

    /** Territory held, as a percentage each for neutral, VS, NC and TR (index 1 to 3 for the factions). */
    readonly score = signal<number[]>([0, 0, 0, 0]);

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

    /** The zone's events, newest first. The log fills as the page receives events, so it is read on every check. */
    logs() {
        return this.parent.zoneLogs[this.zoneId()] || [];
    }

    getFacilityName(facilityId: number | string): string {
        return this.zoneHelper.getFacilityName(this.zoneId(), facilityId);
    }

    focusFacility(facilityId: number | string) {
        this.focusFacilityEmitter.emit(facilityId);
    }

    onScoreChange(newScore: number[]) {
        this.score.set(newScore);
    }
}
