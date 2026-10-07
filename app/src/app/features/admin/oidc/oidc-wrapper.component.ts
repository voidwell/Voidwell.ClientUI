import { Component } from '@angular/core';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    templateUrl: './oidc-wrapper.component.html',
    imports: [VWTabNavSubBarComponent, RouterOutlet]
})

export class OidcWrapperComponent {
    navLinks = [
        { path: 'clients', display: 'Clients' },
        { path: 'resources', display: 'Api Resources' }
    ];
}