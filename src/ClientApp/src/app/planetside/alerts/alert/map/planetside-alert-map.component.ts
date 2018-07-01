import { Component, OnInit, Injector } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    templateUrl: './planetside-alert-map.template.html',
    styleUrls: ['./planetside-alert-map.styles.css']
})

export class PlanetsideAlertMapComponent implements OnInit {
    dataSource: TableDataSource;

    constructor(private injector: Injector) {
    }

    ngOnInit() {
        var inj: any = this.injector;
        let combatEvent = inj.view.viewContainerParent.component;

        combatEvent.event.subscribe(alert => {
            if (alert == null) {
                return;
            }

            this.dataSource = new TableDataSource(alert.log.captureLog);
        });
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return first.pipe(map(() => {
            const data = this.data.slice();
            return data;
        }));
    }

    disconnect() { }
}