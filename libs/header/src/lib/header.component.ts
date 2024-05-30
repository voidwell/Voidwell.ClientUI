import { Component } from '@angular/core';
import { NavMenuService } from '@voidwell/navigation';

@Component({
    selector: 'vw-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.styles.scss']
})
export class HeaderComponent {
    constructor(public navMenuService: NavMenuService) {
    }

    public toggleNav() {
        this.navMenuService.toggle();
    }
}