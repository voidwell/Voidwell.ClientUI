import { Component } from '@angular/core';
import { NavMenuService } from './../shared/services/nav-menu.service';
import { SearchService } from './../shared/services/search.service';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.template.html',
    styleUrls: ['./vw-header.styles.css']
})

export class VWHeaderComponent {
    constructor(public navMenuService: NavMenuService, public searchService: SearchService) {
        
    }

    public toggleNav() {
        this.navMenuService.toggle();
    }
}