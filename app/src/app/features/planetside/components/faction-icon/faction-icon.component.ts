import { Component, computed, input } from '@angular/core';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { FactionNamePipe } from '../../pipes/faction-name.pipe';

/** Census image ids of the faction emblems: VS, NC, TR and NSO. */
const FACTION_IMAGES: Record<number, number> = { 1: 94, 2: 12, 3: 18, 4: 93615 };

/** A faction's emblem, named on hover; nothing for an unknown faction. Size it with the host's width and height. */
@Component({
    selector: 'vw-faction-icon',
    template: `@if (imageId(); as imageId) {<img [src]="imageId | dgcImageUrl" [alt]="factionId() | factionName" [title]="factionId() | factionName">}`,
    styles: `
        :host { display: inline-flex; flex: none; width: 18px; height: 18px; }
        img { width: 100%; height: 100%; object-fit: contain; }
    `,
    imports: [DgcImageUrlPipe, FactionNamePipe]
})
export class FactionIconComponent {
    readonly factionId = input.required<number>();

    readonly imageId = computed(() => FACTION_IMAGES[this.factionId()]);
}
