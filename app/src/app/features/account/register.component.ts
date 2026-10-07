import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectRegistrationState } from '@core/store/app.states';
import { NgForm, FormsModule } from '@angular/forms';
import { RegisterUser } from '@core/store/actions/registration.actions';
import { AccountRepository } from '@core/api/auth/account.repository';
import { RegistrationForm } from '@core/api/models/auth/account.model';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatSelect, MatOption } from '@angular/material/select';
import { SlicePipe } from '@angular/common';

@Component({
    selector: 'voidwell-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [MatCard, MatCardHeader, MatCardTitle, ErrorMessageComponent, MatCardContent, LoaderComponent, MatTabGroup, MatTab, FormsModule, MatFormField, MatInput, MatButton, MatSelect, MatOption, SlicePipe]
})

export class RegisterComponent {
    private accountRepository = inject(AccountRepository);
    private store = inject<Store<AppState>>(Store);

    self = this;
    errorMessage: string = null;
    completedInfo: boolean = false;
    registrationSuccess: boolean = false;
    isLoading: boolean = false;
    selectedTabIndex: number = 0;
    securityQuestions: Array<string> = null;

    selectedQuestion1: string;
    selectedQuestion2: string;
    selectedQuestion3: string;

    registrationInfo: Omit<RegistrationForm, 'securityQuestions'>;

    constructor() {
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
            const formQuestions = securityQuestionsForm.value;
            const questions = [
                { question: formQuestions.question0, answer: formQuestions.answer0 },
                { question: formQuestions.question1, answer: formQuestions.answer1 },
                { question: formQuestions.question2, answer: formQuestions.answer2 }
            ];

            this.store.dispatch(new RegisterUser({ registrationForm: { ...this.registrationInfo, securityQuestions: questions } }));
        }
    }

    private loadSecurityQuestions() {
        this.accountRepository.getSecurityQuestions()
            .subscribe(result => {
                this.securityQuestions = result;
            });
        
    }
}