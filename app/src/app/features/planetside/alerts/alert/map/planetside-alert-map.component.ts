import { Component, EventEmitter, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { FactionBarComponent } from '../../../components/faction-bar/faction-bar.component';
import { FactionIconComponent } from '../../../components/faction-icon/faction-icon.component';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { CaptureFilter, captureRows } from '../../../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { ReplayMapComponent } from './replay-map/replay-map.component';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';

/** The replay of an alert or event on its map, with the log of the facilities taken and held. */
@Component({
    templateUrl: './planetside-alert-map.component.html',
    styleUrls: ['./planetside-alert-map.component.css'],
    imports: [ChipsComponent, MatCard, MatCardTitle, MatCardContent, ReplayMapComponent, RouterLink, NgClass, DatePipe, FactionBarComponent, FactionIconComponent, FactionColorPipe]
})
export class PlanetsideAlertMapComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    focusFacilityEmitter: EventEmitter<number | string> = new EventEmitter<number | string>();
    focusTimestampEmitter: EventEmitter<string> = new EventEmitter<string>();

    readonly filter = signal<CaptureFilter>({ captures: true, defends: false });
    readonly kindOptions: ChipOption<keyof CaptureFilter>[] = [
        { value: 'captures', label: 'Captures' },
        { value: 'defends', label: 'Defends' }
    ];
    readonly pickedKinds = computed(() => this.kindOptions.map(option => option.value).filter(kind => this.filter()[kind]));

    /** The alert, when it has a map to replay; an event has none. */
    readonly alert = computed<AlertResult | null>(() => {
        const event = this.parentEventComponent.event();
        return event && 'zoneSnapshot' in event ? event : null;
    });
    readonly mapEnabled = computed(() => !!this.alert()?.zoneSnapshot);
    readonly rows = computed(() => captureRows(this.parentEventComponent.event()?.log?.captureLog, this.filter()));

    toggle(kind: keyof CaptureFilter): void {
        this.filter.update(filter => ({ ...filter, [kind]: !filter[kind] }));
    }

    onFocusFacility(mapRegionId: number | undefined) {
        this.focusFacilityEmitter.emit(mapRegionId);
    }

    onFocusTimestamp(timestamp: string) {
        this.focusTimestampEmitter.emit(timestamp);
    }

    constructor() {
        this.parentEventComponent.section.set('Map');
    }
}
