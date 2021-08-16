import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from "rxjs";
import { PlanetsideApi } from './../shared/services/planetside-api.service';

@Component({
    templateUrl: './planetside-item.template.html',
    styleUrls: ['./planetside-item.styles.css']
})

export class PlanetsideItemComponent implements OnDestroy {
    errorMessage: string = null;
    isLoading: boolean = true;
    itemId: string;

    routeSub: Subscription;
    itemIdChange: EventEmitter<string> = new EventEmitter<string>();
    weaponData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private api: PlanetsideApi, private route: ActivatedRoute) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.itemId = id;
            this.itemIdChange.emit(id);
            this.weaponData.next(null);
            this.isLoading = true;

            this.api.getWeaponInfo(id)
                .subscribe(data => {
                    this.weaponData.next(data);
                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.weaponData.unsubscribe();
    }
}