import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { IAppState } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'voidwell-register',
    templateUrl: './register.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class RegisterComponent implements OnDestroy {
    self = this;
    errorMessage: string = null;

    constructor() {

    }

    onSubmit(registerForm: NgForm) {
        console.log('submit', registerForm.value);
    }

    ngOnDestroy() {

    }
}