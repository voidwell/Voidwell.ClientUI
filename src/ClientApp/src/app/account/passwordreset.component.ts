import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { IAppState } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'voidwell-password-reset',
    templateUrl: './passwordreset.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class PasswordResetComponent {
    isLoading: boolean = false;
    securityQuestions: Array<any>;
    resetToken: string = null;
    resetSuccess: boolean = false;
    userEmail: string = null;

    constructor(private api: VoidwellApi) {

    }

    onSubmitResetStart(passwordResetStart: NgForm) {
        if (passwordResetStart.valid) {
            this.isLoading = true;
            this.api.startResetPassword(passwordResetStart.value)
                .subscribe(result => {
                    this.userEmail = passwordResetStart.value.email;
                    this.securityQuestions = result.map(function (question) {
                        return {
                            question: question,
                            answer: ''
                        };
                    });
                    this.isLoading = false;
                });
        }
    }

    onSubmitResetPasswordQuestions() {
        this.isLoading = true;
        let resetForm = {
            email: this.userEmail,
            questions: this.securityQuestions
        };

        this.api.resetPasswordQuestions(resetForm)
            .subscribe(result => {
                this.resetToken = result;
                this.securityQuestions = null;
                this.isLoading = false;
            });
    }

    onSubmitChangePassword(passwordResetForm: NgForm) {
        if (passwordResetForm.valid) {
            this.isLoading = true;
            var resetForm = Object.assign({}, passwordResetForm.value);
            resetForm.token = this.resetToken;
            resetForm.email = this.userEmail;

            this.api.resetPassword(resetForm)
                .subscribe(result => {
                    this.isLoading = false;
                    this.resetSuccess = true;
                });
        }
    }
}