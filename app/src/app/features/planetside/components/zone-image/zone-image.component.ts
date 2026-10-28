import { Component, computed, input } from '@angular/core';
import { zoneImageUrl } from './zone-image';

/** A small rounded thumbnail of a continent, or a quiet placeholder of the same size when the zone has no artwork. */
@Component({
    selector: 'vw-zone-image',
    template: `
        @if (url(); as src) {
            <img [src]="src" alt="" [style.width.px]="size()" [style.height.px]="size()" />
        } @else {
            <span class="placeholder" [style.width.px]="size()" [style.height.px]="size()"></span>
        }`,
    styles: `
        :host { display: inline-flex; flex: none; }
        img, .placeholder { border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08); }
        img { object-fit: cover; }
        .placeholder { background: rgba(255, 255, 255, 0.05); }`
})
export class ZoneImageComponent {
    readonly zoneId = input<number | string | null | undefined>();
    /** The width and height in pixels. */
    readonly size = input(44);

    readonly url = computed(() => zoneImageUrl(this.zoneId()));
}
