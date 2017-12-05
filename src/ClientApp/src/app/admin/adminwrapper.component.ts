import { Component } from '@angular/core';

@Component({
    selector: 'voidwell-admin-wrapper',
    templateUrl: './adminwrapper.template.html',
    styleUrls: ['../app.styles.css']
})

export class AdminWrapperComponent {
    navLinks = [
        { path: 'dashboard', label: 'Dashboard' },
        { path: 'blog', label: 'Blog' },
        { path: 'users', label: 'Users' },
        { path: 'roles', label: 'Roles' }
    ];
}