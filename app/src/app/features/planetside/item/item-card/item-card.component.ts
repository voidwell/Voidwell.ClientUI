import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { FactionIconComponent } from '../../components/faction-icon/faction-icon.component';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { FactionNamePipe } from '../../pipes/faction-name.pipe';

/** The weapon's name, category, faction, description and image, on the item page. */
@Component({
    selector: 'item-card',
    templateUrl: './item-card.component.html',
    styleUrls: ['./item-card.component.css'],
    imports: [MatCard, NgClass, FactionIconComponent, DgcImageUrlPipe, FactionNamePipe]
})
export class ItemCardComponent {
    readonly itemComponent = inject(PlanetsideItemComponent);

    readonly itemData = this.itemComponent.weaponData;
}
