import { Component, OnInit, EventEmitter } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlanetsideCombatEventComponent } from '../../../combat-event/planetside-combat-event.component';

@Component({
    templateUrl: './planetside-alert-map.template.html',
    styleUrls: ['./planetside-alert-map.styles.css']
})

export class PlanetsideAlertMapComponent implements OnInit {
    ownershipSub: BehaviorSubject<any> = new BehaviorSubject(null);
    focusFacilityEmitter: EventEmitter<any> = new EventEmitter<any>();
    focusTimestampEmitter: EventEmitter<any> = new EventEmitter<any>();
    alert: any;
    dataSource: TableDataSource;

    filterState = {
        captures: true,
        defends: false
    };

    constructor(private parentEventComponent: PlanetsideCombatEventComponent) {
    }

    ngOnInit() {
        this.parentEventComponent.event.subscribe(alert => {
            if (alert == null) {
                return;
            }

            this.alert = alert;
            this.ownershipSub.next(alert.zoneSnapshot);
            this.dataSource = new TableDataSource(alert.log.captureLog);
            this.dataSource.filter = this.filterState;
        });
    }

    onFocusFacility(mapRegionId) {
        this.focusFacilityEmitter.emit(mapRegionId);
    }

    onFocusTimestamp(timestamp) {
        this.focusTimestampEmitter.emit(timestamp);
    }

    onFilterToggle(event) {
        this.filterState[event.value] = event.source.checked;
        this.dataSource.filter = this.filterState;
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    _filterChange = new BehaviorSubject(null);
    get filter() { return this._filterChange.value; }
    set filter(filter) { this._filterChange.next(filter); }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return merge(first, this._filterChange).pipe(map(() => {
            const data = this.data.slice();

            if (!this.filter) {
                return data;
            }

            let filteredData = data.filter(item => {
                return (this.filter.captures && item.newFactionId !== item.oldFactionId) || (this.filter.defends && item.newFactionId === item.oldFactionId)
            });

            return filteredData;
        }));
    }

    disconnect() { }
}