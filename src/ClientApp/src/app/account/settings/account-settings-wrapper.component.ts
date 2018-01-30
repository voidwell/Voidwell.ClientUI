import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: './account-settings-wrapper.template.html',
    styleUrls: ['./account-settings-wrapper.styles.css']
})

export class AccountSettingsWrapperComponent {
    navLinks = [
        { path: 'password', label: 'Password' }
    ];

    constructor(private router: Router) {
    }
}