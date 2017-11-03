import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../shared/services/header.service';

@Component({
    selector: 'vw-navbar',
    templateUrl: './vw-navbar.template.html',
    styleUrls: ['./vw-navbar.styles.css']
})

export class VWNavbarComponent implements OnInit {
    private header;

    constructor(private headerService: HeaderService) { }

    ngOnInit() {
        this.header = this.headerService.activeHeader;
    }
}