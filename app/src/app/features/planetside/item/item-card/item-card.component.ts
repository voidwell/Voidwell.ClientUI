import { Component, inject } from '@angular/core';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardFooter } from '@angular/material/card';
import { NgClass } from '@angular/common';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';

@Component({
    selector: 'item-card',
    templateUrl: './item-card.component.html',
    styleUrls: ['./item-card.component.css'],
    imports: [MatCard, NgClass, MatCardTitle, MatCardSubtitle, MatCardFooter, VWTabNavSubBarComponent]
})

export class ItemCardComponent {
    itemComponent = inject(PlanetsideItemComponent);

    readonly itemData = this.itemComponent.weaponData;

    navLinks = [
        { path: 'stats', display: 'Stats' },
        { path: 'leaderboard', display: 'Leaderboard' }
    ];

}