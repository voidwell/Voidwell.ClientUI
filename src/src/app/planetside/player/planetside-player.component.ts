import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanetsideApi } from './../shared/services/planetside-api.service';

@Component({
    selector: 'planetside-player',
    templateUrl: './planetside-player.template.html',
    providers: [PlanetsideApi]
})

export class PlanetsidePlayerComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string = null;
    playerData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private routeSub: Subscription;

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private router: Router) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.isLoading = true;
            this.errorMessage = null;

            this.playerData.next(null);

            this.api.getCharacter(id)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body || error.statusText
                    this.isLoading = false;
                    return throwError(error);
                }))
                .subscribe(data => {
                    this.playerData.next(data);
                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy() {
        this.playerData.unsubscribe();
        this.routeSub.unsubscribe();
    }
}