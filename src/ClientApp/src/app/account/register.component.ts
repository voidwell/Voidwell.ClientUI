import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { IAppState } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';

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
    registrationState: Observable<any>;

    registrationInfo: any;

    constructor(private api: VoidwellApi, private ngRedux: NgRedux<IAppState>) {
        this.registrationState = this.ngRedux.select('registration');
        this.registrationState.subscribe(registration => {
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
                    this.errorMessage = registration.errorMessage;
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

            this.api.accountRegister(this.registrationInfo);
        }
    }

    private loadSecurityQuestions() {
        this.api.getSecurityQuestions()
            .subscribe(result => {
                this.securityQuestions = result;
            });
        
    }
}