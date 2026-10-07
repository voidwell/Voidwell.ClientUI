import { Component, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NgForm, FormsModule } from '@angular/forms';
import { AccountRepository } from '@core/api/auth/account.repository';
import { ResetPasswordRequest, SecurityQuestionAnswer } from '@core/api/models/auth/account.model';
import { getErrorMessage } from '@core/util/error-message';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'voidwell-password-reset',
    templateUrl: './password-reset.component.html',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, LoaderComponent, FormsModule, MatFormField, MatInput, MatButton]
})

export class PasswordResetComponent {
    private accountRepository = inject(AccountRepository);

    isLoading: boolean = false;
    securityQuestions: SecurityQuestionAnswer[] | null;
    resetToken: string = null;
    resetSuccess: boolean = false;
    userEmail: string = null;
    errorMessage: string;

    onSubmitResetStart(passwordResetStart: NgForm) {
        this.errorMessage = null;

        if (passwordResetStart.valid) {
            this.isLoading = true;
            this.accountRepository.resetPasswordStart(passwordResetStart.value)
                .pipe(catchError(error => {
                    this.errorMessage = getErrorMessage(error)
                    return throwError(() => error);
                }))
                .pipe(finalize(() => {
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

        const resetForm = {
            email: this.userEmail,
            questions: this.securityQuestions
        };

        this.accountRepository.resetPasswordQuestions(resetForm)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
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
            const resetForm: ResetPasswordRequest = {
                newPassword: passwordResetForm.value.newPassword,
                token: this.resetToken,
                email: this.userEmail
            };

            this.accountRepository.resetPassword(resetForm)
                .pipe(catchError(error => {
                    this.errorMessage = getErrorMessage(error)
                    return throwError(() => error);
                }))
                .pipe(finalize(() => {
                    this.isLoading = false;
                }))
                .subscribe(result => {
                    this.resetSuccess = true;
                });
        }
    }
}