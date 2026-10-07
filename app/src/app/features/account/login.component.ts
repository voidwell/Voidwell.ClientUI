import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'voidwell-login',
    templateUrl: './login.component.html',
    imports: [MatCard, MatCardTitle, RouterLink, FormsModule, MatFormField, MatInput, MatButton]
})

export class LoginComponent {
    self = this;
    errorMessage: string = null;

    constructor() {
    }

    onSubmit(loginForm: NgForm) {
        console.log('submit', loginForm.value);
    }
}