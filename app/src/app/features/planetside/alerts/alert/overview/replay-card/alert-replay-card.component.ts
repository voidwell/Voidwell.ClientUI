import { Component, EventEmitter, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { FactionIconComponent } from '../../../../components/faction-icon/faction-icon.component';
import { PlanetsideCombatEventComponent } from '../../../../components/combat-event/planetside-combat-event.component';
import { CaptureFilter, captureRows } from '../../../../components/combat-report/combat-report-figures';
import { ReplayMapComponent } from '../../map/replay-map/replay-map.component';

/**
 * The replay of an alert on its map, with the log beside it of the facilities taken and held: a green shield for a defence or
 * flag for a capture, then the faction that held the facility, or the faction it was taken from, an arrow and the faction
 * that took it. On a phone the log is a drawer over the map. An event
 * has no map to replay, so it shows the log alone.
 */
@Component({
    selector: 'alert-replay-card',
    templateUrl: './alert-replay-card.component.html',
    styleUrl: './alert-replay-card.component.css',
    imports: [ChipsComponent, MatCard, MatCardTitle, MatCardContent, MatIcon, ReplayMapComponent, RouterLink, DatePipe, FactionIconComponent]
})
export class AlertReplayCardComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    focusFacilityEmitter: EventEmitter<number | string> = new EventEmitter<number | string>();
    focusTimestampEmitter: EventEmitter<string> = new EventEmitter<string>();

    /** Whether the events cover the map, which they do only on a phone, where there is no room beside it. */
    readonly drawerOpen = signal(false);

    readonly filter = signal<CaptureFilter>({ captures: true, defends: true });
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

    onFocusFacility(mapRegionId: number | undefined): void {
        this.drawerOpen.set(false);
        this.focusFacilityEmitter.emit(mapRegionId);
    }

    onFocusTimestamp(timestamp: string): void {
        this.drawerOpen.set(false);
        this.focusTimestampEmitter.emit(timestamp);
    }
}
