import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-tab-nav-sub-bar',
    templateUrl: './vw-tab-nav-sub-bar.template.html',
    styleUrls: ['./vw-tab-nav-sub-bar.styles.css']
})

export class VWTabNavSubBarComponent {
    @Input("links") navLinks: Array<any>;
}