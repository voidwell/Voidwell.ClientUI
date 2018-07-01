import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    templateUrl: './planetside-world-wrapper.template.html',
    styleUrls: ['./planetside-world-wrapper.styles.css']
})

export class PlanetsideWorldWrapperComponent {
    isLoading: boolean;
    errorMessage: string = null;
    worlds: any[];

    constructor(private api: PlanetsideApi) {
        this.isLoading = true;
        this.errorMessage = null;

        this.api.getWorldStates()
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                this.isLoading = false;
                return Observable.throw(error);
            }))
            .subscribe(worlds => {
                this.worlds = worlds;
                this.isLoading = false;
            });
    }
}