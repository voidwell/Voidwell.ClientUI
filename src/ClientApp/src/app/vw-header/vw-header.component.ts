import { Component } from '@angular/core';
import { HeaderService } from '../shared/services/header.service';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.template.html',
    styleUrls: ['./vw-header.styles.css']
})

export class VWHeaderComponent {
    private header;

    constructor(private headerService: HeaderService) {
        this.header = this.headerService.activeHeader;
    }
}