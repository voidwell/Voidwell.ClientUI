import { Component, Input } from '@angular/core';
import { HeaderService } from './../../services/header.service';

@Component({
    selector: 'vw-tab-nav-bar',
    templateUrl: './vw-tab-nav-bar.template.html',
    styleUrls: ['./vw-tab-nav-bar.styles.css']
})

export class VWTabNavBarComponent {
    @Input("links") navLinks: Array<any>;

    public header;

    constructor(private headerService: HeaderService) {
        this.headerService.activeHeader
            .subscribe(header => {
                this.header = header;
            });
    }
}