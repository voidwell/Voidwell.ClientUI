import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatCard, MatCardFooter } from '@angular/material/card';
import { BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { FactionIconComponent } from '../../components/faction-icon/faction-icon.component';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { FactionNamePipe } from '../../pipes/faction-name.pipe';

/** The weapon's name, category, faction, description and image, with the page's breadcrumbs. */
@Component({
    selector: 'item-card',
    templateUrl: './item-card.component.html',
    styleUrls: ['./item-card.component.css'],
    imports: [MatCard, MatCardFooter, NgClass, BreadcrumbsComponent, FactionIconComponent, DgcImageUrlPipe, FactionNamePipe]
})
export class ItemCardComponent {
    readonly itemComponent = inject(PlanetsideItemComponent);

    readonly itemData = this.itemComponent.weaponData;
}
