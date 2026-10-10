import { Component, ChangeDetectionStrategy, OnInit, EventEmitter, inject, Injector, effect, untracked, signal } from '@angular/core';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { ZoneRegionOwnership } from '@core/api/models/ps2/map.model';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { MatButtonToggleChange, MatButtonToggle } from '@angular/material/button-toggle';
import { ReplayMapComponent } from './replay-map/replay-map.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FactionBarComponent } from '../../../components/faction-bar/faction-bar.component';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { FactionCodePipe } from '../../../pipes/faction-code.pipe';
import { AlertMapDataSource, CaptureFilter } from './planetside-alert-map.data-source';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-alert-map.component.html',
    styleUrls: ['./planetside-alert-map.component.css'],
    imports: [ReplayMapComponent, MatButtonToggle, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, NgClass, RouterLink, FactionBarComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DatePipe, FactionColorPipe, FactionCodePipe]
})

export class PlanetsideAlertMapComponent implements OnInit {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);
    private injector = inject(Injector);

    readonly ownership = signal<ZoneRegionOwnership[] | null>(null);
    focusFacilityEmitter: EventEmitter<number | string> = new EventEmitter<number | string>();
    focusTimestampEmitter: EventEmitter<string> = new EventEmitter<string>();
    alert: AlertResult;
    dataSource: AlertMapDataSource;

    filterState: CaptureFilter = {
        captures: true,
        defends: false
    };

    ngOnInit() {
        effect(() => {
            const alert = this.parentEventComponent.event();

            untracked(() => {
                if (alert == null || !('zoneSnapshot' in alert)) {
                    return;
                }

                this.alert = alert;
                this.ownership.set(alert.zoneSnapshot);
                this.dataSource = new AlertMapDataSource(alert.log.captureLog);
                this.dataSource.filter = this.filterState;
            });
        }, { injector: this.injector });
    }

    onFocusFacility(mapRegionId: number) {
        this.focusFacilityEmitter.emit(mapRegionId);
    }

    onFocusTimestamp(timestamp: string) {
        this.focusTimestampEmitter.emit(timestamp);
    }

    onFilterToggle(event: MatButtonToggleChange) {
        this.filterState[event.value as keyof CaptureFilter] = event.source.checked;
        this.dataSource.filter = this.filterState;
    }
}

