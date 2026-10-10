import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PlanetsideItemComponent } from './planetside-item.component';
import { MatCard, MatCardContent } from '@angular/material/card';
import { PlanetsideItemDamageCardComponent } from './damage-card/planetside-item-damage-card.component';
import { NgClass } from '@angular/common';
import { DgcImageUrlPipe } from '../pipes/dgc-image-url.pipe';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { FactionNamePipe } from '../pipes/faction-name.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-item-stats.component.html',
    styleUrls: ['./planetside-item-stats.component.css'],
    imports: [MatCard, MatCardContent, PlanetsideItemDamageCardComponent, NgClass, DgcImageUrlPipe, FactionColorPipe, FactionNamePipe]
})

export class PlanetsideItemStatsComponent {
    private itemComponent = inject(PlanetsideItemComponent);

    readonly weaponData = this.itemComponent.weaponData;
}