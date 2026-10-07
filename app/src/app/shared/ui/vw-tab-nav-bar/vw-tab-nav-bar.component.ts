import { Component, Input } from '@angular/core';
import { NavLink } from '../nav-link.model';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
    selector: 'vw-tab-nav-bar',
    templateUrl: './vw-tab-nav-bar.component.html',
    styleUrls: ['./vw-tab-nav-bar.component.css'],
    imports: [RouterLinkActive, RouterLink, NgClass]
})

export class VWTabNavBarComponent {
    @Input() links: NavLink[];
}