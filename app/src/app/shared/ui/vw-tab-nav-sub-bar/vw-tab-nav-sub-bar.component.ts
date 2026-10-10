import { Component, Input } from '@angular/core';
import { NavLink } from '../nav-link.model';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'vw-tab-nav-sub-bar',
    templateUrl: './vw-tab-nav-sub-bar.component.html',
    styleUrls: ['./vw-tab-nav-sub-bar.component.css'],
    imports: [RouterLinkActive, RouterLink, NgClass, MatIcon]
})

export class VWTabNavSubBarComponent {
    @Input() links: NavLink[];
}