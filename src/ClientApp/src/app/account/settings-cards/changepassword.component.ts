import { Component } from '@angular/core';
import { VoidwellApi } from '../../shared/services/voidwell-api.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'voidwell-user-settings-change-password',
    templateUrl: './changepassword.template.html',
    styleUrls: ['../../app.styles.css'],
    providers: [VoidwellApi]
})

export class ChangePasswordCardComponent {
    isLoading: boolean = false;
    errorMessage: string = null;

    constructor(private api: VoidwellApi) {

    }

    onSubmitChangePassword(passwordChangeForm: NgForm) {
        if (passwordChangeForm.valid) {
            this.isLoading = true;
            this.errorMessage = null;

            this.api.changePassword(passwordChangeForm.value)
                .subscribe(success => {
                    passwordChangeForm.reset();
                    this.isLoading = false;
                },
                error => {
                    this.errorMessage = error._body;
                    this.isLoading = false;
                });
        }
    }
}