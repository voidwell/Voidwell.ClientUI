import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject, throwError } from "rxjs";
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsideApi } from './../shared/services/planetside-api.service';

@Component({
    templateUrl: './planetside-item.template.html',
    styleUrls: ['./planetside-item.styles.css']
})

export class PlanetsideItemComponent implements OnDestroy {
    errorMessage: string = null;
    isLoading: boolean = true;

    routeSub: Subscription;
    itemId: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    weaponData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private api: PlanetsideApi, private route: ActivatedRoute) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.errorMessage = null;
            this.itemId.next(id);
            this.weaponData.next(null);
            this.isLoading = true;

            this.api.getWeaponInfo(id)
                .pipe<any>(catchError(error => {
                    if (error.status != 404) {
                        this.errorMessage = error.statusText
                        return throwError(error);
                    }
                }))
                .pipe<any>(finalize(() => {
                    this.isLoading = false;
                }))
                .subscribe(data => {
                    this.weaponData.next(data);
                });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.weaponData.unsubscribe();
        this.itemId.unsubscribe();
    }
}