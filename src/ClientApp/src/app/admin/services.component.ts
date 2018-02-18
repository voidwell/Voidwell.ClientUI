import { Component } from '@angular/core';
import { VoidwellApi } from '../shared/services/voidwell-api.service';

@Component({
    templateUrl: './services.template.html'
})

export class ServicesComponent {
    isLoading: boolean = true;
    planetsideServices: any[] = [];

    constructor(private api: VoidwellApi) {
        this.isLoading = true;

        this.api.getPS2AllServiceStatus()
            .subscribe(services => {
                this.planetsideServices = services;

                this.isLoading = false;
            });
    }
}