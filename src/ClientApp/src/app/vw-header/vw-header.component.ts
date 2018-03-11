import { Component } from '@angular/core';
import { HeaderService } from '../shared/services/header.service';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.template.html',
    styleUrls: ['./vw-header.styles.css']
})

export class VWHeaderComponent {
    public header;

    constructor(private headerService: HeaderService) {
        this.headerService.activeHeader
            .subscribe(header => {
                this.header = header;
            });
    }
}