import { Component } from '@angular/core';

@Component({
    templateUrl: './oidcwrapper.template.html'
})

export class OidcWrapperComponent {
    navLinks = [
        { path: 'clients', display: 'Clients' },
        { path: 'resources', display: 'Api Resources' }
    ];
}