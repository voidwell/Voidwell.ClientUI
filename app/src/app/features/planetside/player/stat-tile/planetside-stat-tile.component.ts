import { Component, input } from '@angular/core';

/** A labelled figure in the tile style of the player overview cards; the figure is the content. */
@Component({
    selector: 'planetside-stat-tile',
    templateUrl: './planetside-stat-tile.component.html',
    styleUrl: './planetside-stat-tile.component.css'
})
export class PlanetsideStatTileComponent {
    readonly label = input.required<string>();
    readonly note = input<string>();
}
