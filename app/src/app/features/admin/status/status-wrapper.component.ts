import { Component } from '@angular/core';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    templateUrl: './status-wrapper.component.html',
    imports: [VWTabNavSubBarComponent, RouterOutlet]
})

export class StatusWrapperComponent {
    navLinks = [
        { path: 'services', display: 'Services' },
        { path: 'stores', display: 'Stores' }
    ];
}