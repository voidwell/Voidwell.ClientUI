import { Component } from '@angular/core';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { IAppState } from '../app.component';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'voidwell-password-reset',
    templateUrl: './passwordreset.template.html'
})

export class PasswordResetComponent {
    isLoading: boolean = false;
    securityQuestions: Array<any>;
    resetToken: string = null;
    resetSuccess: boolean = false;
    userEmail: string = null;
    errorMessage: string;

    constructor(private api: VoidwellApi) {
    }

    onSubmitResetStart(passwordResetStart: NgForm) {
        this.errorMessage = null;

        if (passwordResetStart.valid) {
            this.isLoading = true;
            this.api.startResetPassword(passwordResetStart.value)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body || error.statusText
                    return throwError(error);
                }))
                .pipe<any>(finalize(() => {
                    this.isLoading = false;
                }))
                .subscribe(result => {
                    this.userEmail = passwordResetStart.value.email;
                    this.securityQuestions = result.map(function (question) {
                        return {
                            question: question,
                            answer: ''
                        };
                    });
                });
        }
    }

    onSubmitResetPasswordQuestions() {
        this.errorMessage = null;
        this.isLoading = true;

        let resetForm = {
            email: this.userEmail,
            questions: this.securityQuestions
        };

        this.api.resetPasswordQuestions(resetForm)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body || error.statusText
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(result => {
                this.resetToken = result;
                this.securityQuestions = null;
            });
    }

    onSubmitChangePassword(passwordResetForm: NgForm) {
        this.errorMessage = null;

        if (passwordResetForm.valid) {
            this.isLoading = true;
            var resetForm = Object.assign({}, passwordResetForm.value);
            resetForm.token = this.resetToken;
            resetForm.email = this.userEmail;

            this.api.resetPassword(resetForm)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body || error.statusText
                    return throwError(error);
                }))
                .pipe<any>(finalize(() => {
                    this.isLoading = false;
                }))
                .subscribe(result => {
                    this.resetSuccess = true;
                });
        }
    }
}