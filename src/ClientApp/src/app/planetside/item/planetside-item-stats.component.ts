import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PlanetsideItemComponent } from './planetside-item.component';

@Component({
    templateUrl: './planetside-item-stats.template.html',
    styleUrls: ['./planetside-item-stats.styles.css']
})

export class PlanetsideItemStatsComponent implements OnDestroy {
    weaponDataSub: Subscription;
    isLoading: boolean = true;
    weaponData: any;

    constructor(private itemComponent: PlanetsideItemComponent) {
        this.weaponDataSub = this.itemComponent.weaponData.subscribe(data => {
            if (data) {
                this.weaponData = data;
                this.isLoading = false;
            }
        });

    }

    ngOnDestroy() {
        this.weaponDataSub.unsubscribe();
    }
}