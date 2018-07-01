import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-tab-nav-bar',
    templateUrl: './vw-tab-nav-bar.template.html',
    styleUrls: ['./vw-tab-nav-bar.styles.css']
})

export class VWTabNavBarComponent {
    @Input("links") navLinks: Array<any>;
}