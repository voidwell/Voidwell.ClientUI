import { Component, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
    templateUrl: './account-settings-wrapper.component.html',
    styleUrls: ['./account-settings-wrapper.component.css'],
    imports: [RouterLinkActive, RouterLink, NgClass, RouterOutlet]
})

export class AccountSettingsWrapperComponent {
    private router = inject(Router);

    navLinks = [
        { path: 'password', label: 'Password' }
    ];
}