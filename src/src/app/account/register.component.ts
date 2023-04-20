import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { AppState, selectRegistrationState } from '../store/app.states';
import { NgForm } from '@angular/forms';
import { RegisterUser } from '../store/actions/registration.actions';

@Component({
    selector: 'voidwell-register',
    templateUrl: './register.template.html',
    styleUrls: ['account.styles.css'],
    providers: [VoidwellApi]
})

export class RegisterComponent {
    self = this;
    errorMessage: string = null;
    completedInfo: boolean = false;
    registrationSuccess: boolean = false;
    isLoading: boolean = false;
    selectedTabIndex: number = 0;
    securityQuestions: Array<string> = null;

    registrationInfo: any;

    constructor(private api: VoidwellApi, private store: Store<AppState>) {
        this.store.select(selectRegistrationState)
            .subscribe(registration => {
                if (registration) {
                    if (registration.isSuccess) {
                        this.registrationSuccess = true;
                    }
                    if (registration.status === 'loading') {
                        this.isLoading = true;
                        this.errorMessage = null;
                    } else {
                        this.isLoading = false;
                    }
                    if (registration.status === 'error') {
                        this.errorMessage = registration.error;
                    }
                }
            });
    }

    onSubmitInformation(registerForm: NgForm) {
        if (registerForm.valid)
        {
            this.completedInfo = true;
            this.selectedTabIndex = 1;

            if (this.securityQuestions == null)
            {
                this.registrationInfo = registerForm.value;
                this.loadSecurityQuestions();
            }
        }
    }

    onSubmitQuestions(securityQuestionsForm: NgForm) {
        if (securityQuestionsForm.valid)
        {
            let formQuestions = securityQuestionsForm.value;
            let questions = [
                { question: formQuestions.question0, answer: formQuestions.answer0 },
                { question: formQuestions.question1, answer: formQuestions.answer1 },
                { question: formQuestions.question2, answer: formQuestions.answer2 }
            ];

            this.registrationInfo.securityQuestions = questions;

            this.store.dispatch(new RegisterUser({ registrationForm: this.registrationInfo }));
        }
    }

    private loadSecurityQuestions() {
        this.api.getSecurityQuestions()
            .subscribe(result => {
                this.securityQuestions = result;
            });
        
    }
}