import { Component, OnInit, ViewChild, inject, Injector, effect, untracked } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, MatSortHeader } from '@angular/material/sort';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { NgClass, DecimalPipe } from '@angular/common';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { AlertVehiclesDataSource } from './planetside-alert-vehicles.data-source';

@Component({
    templateUrl: './planetside-alert-vehicles.component.html',
    styleUrls: ['./planetside-alert-vehicles.component.css'],
    imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DecimalPipe, FactionColorPipe]
})

export class PlanetsideAlertVehiclesComponent implements OnInit {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);
    private injector = inject(Injector);

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    dataSource: AlertVehiclesDataSource;

    ngOnInit() {
        effect(() => {
            const alert = this.parentEventComponent.event();

            untracked(() => {
                if (alert == null) {
                    return;
                }

                this.sort.sort(<MatSortable>{
                    id: 'kills',
                    start: 'desc'
                });

                this.dataSource = new AlertVehiclesDataSource(alert.log.stats.vehicles, this.sort, this.paginator);
            });
        }, { injector: this.injector });
    }
}

