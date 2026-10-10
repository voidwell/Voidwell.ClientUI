import { Component, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, inject, Injector, effect, untracked } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, MatSortHeader } from '@angular/material/sort';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { NgClass, DecimalPipe } from '@angular/common';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { AlertPlayersDataSource } from './planetside-alert-players.data-source';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-alert-players.component.html',
    styleUrls: ['./planetside-alert-players.component.css'],
    imports: [MatFormField, MatInput, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, RouterLink, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DecimalPipe, FactionColorPipe]
})

export class PlanetsideAlertPlayersComponent implements OnInit {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);
    private injector = inject(Injector);

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    dataSource: AlertPlayersDataSource;

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

                this.dataSource = new AlertPlayersDataSource(alert.log.stats.participants, this.sort, this.paginator);

                fromEvent(this.filter.nativeElement, 'keyup')
                    .pipe(debounceTime(150))
                    .pipe(distinctUntilChanged())
                    .subscribe(() => {
                        if (!this.dataSource) { return; }
                        this.dataSource.filter = this.filter.nativeElement.value;
                    });
            });
        }, { injector: this.injector });
    }
}

