import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlanetsideItemComponent } from './../planetside-item.component';

@Component({
    selector: 'item-card',
    templateUrl: './item-card.template.html',
    styleUrls: ['./item-card.styles.css']
})

export class ItemCardComponent implements OnInit, OnDestroy {
    itemDataSub: Subscription;
    itemData: any;

    navLinks = [
        { path: 'stats', display: 'Stats' },
        { path: 'leaderboard', display: 'Leaderboard' }
    ];

    constructor(private itemComponent: PlanetsideItemComponent) {
    }

    ngOnInit() {
        this.itemDataSub = this.itemComponent.weaponData.subscribe(data => {
            if (data) {
                this.itemData = data;
            }
        });
    }

    ngOnDestroy() {
        if (this.itemDataSub) this.itemDataSub.unsubscribe();
    }
}