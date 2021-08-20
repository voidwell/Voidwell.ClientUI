import { Component } from '@angular/core';

@Component({
    templateUrl: './statuswrapper.template.html'
})

export class StatusWrapperComponent {
    navLinks = [
        { path: 'services', display: 'Services' },
        { path: 'stores', display: 'Stores' }
    ];
}