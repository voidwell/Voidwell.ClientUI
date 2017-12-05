import { Component } from '@angular/core';

@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetsidewrapper.template.html',
    styleUrls: ['../app.styles.css']
})

export class PlanetsideWrapperComponent {
    navLinks = [
        { path: 'news', label: 'News' },
        { path: 'alerts', label: 'Alerts' }
    ];
}