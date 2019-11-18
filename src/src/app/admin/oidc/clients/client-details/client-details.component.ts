import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../../../shared/services/voidwell-api.service';

@Component({
    templateUrl: './client-details.template.html',
    styleUrls: ['./client-details.styles.css']
})

export class ClientDetailsComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string;
    client: any;
    form: FormGroup;

    private routeSub: Subscription;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: VoidwellApi) {
        this.isLoading = true;

        this.form = this.formBuilder.group({
            id: new FormControl(),
            name: ['', Validators.required],
            description: new FormControl(),
            startDate: new FormControl(),
            endDate: new FormControl(),
            isPrivate: new FormControl(false),
            mapId: new FormControl(),
            serverId: new FormControl(),
            gameId: new FormControl('ps2'),
            teams: this.formBuilder.array([])
        });

        this.routeSub = this.route.params.subscribe(params => {
            let clientId = params['clientId'];

            this.api.getClientById(clientId)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body
                    return throwError(error);
                }))
                .pipe<any>(finalize(() => {
                    this.isLoading = false;
                }))
                .subscribe(client => {
                    this.client = client;
                });
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}