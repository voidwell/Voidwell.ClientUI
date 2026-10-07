import { Component, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AccountRepository } from '@core/api/auth/account.repository';
import { getErrorMessage } from '@core/util/error-message';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    templateUrl: './change-password.component.html',
    imports: [MatCard, MatCardHeader, MatCardTitle, LoaderComponent, MatCardContent, FormsModule, MatFormField, MatInput, MatButton]
})

export class ChangePasswordComponent {
    private accountRepository = inject(AccountRepository);

    isLoading: boolean = false;
    errorMessage: string = null;

    onSubmitChangePassword(passwordChangeForm: NgForm) {
        if (passwordChangeForm.valid) {
            this.isLoading = true;
            this.errorMessage = null;

            this.accountRepository.changePassword(passwordChangeForm.value)
                .subscribe(success => {
                    passwordChangeForm.reset();
                    this.isLoading = false;
                },
                error => {
                    this.errorMessage = getErrorMessage(error);
                    this.isLoading = false;
                });
        }
    }
}