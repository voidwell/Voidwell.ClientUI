import { Component, input, model } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PlatformInfo } from '@shared/utils/platforms';

let nextId = 0;

/**
 * A titled section for the content of one platform: the platform's icon and name, then whatever is
 * projected in. Clicking the header collapses and expands the content.
 */
@Component({
    selector: 'vw-platform-section',
    templateUrl: './platform-section.component.html',
    styleUrl: './platform-section.component.css',
    imports: [MatIcon]
})
export class PlatformSectionComponent {
    readonly platform = input.required<PlatformInfo>();
    /** How many items the section holds; shown next to the name when set. */
    readonly count = input<number>();
    /** Whether the content is shown. Sections start expanded; bind with `[(expanded)]` to follow or set it. */
    readonly expanded = model(true);

    /** Ties the header button to the content it controls. */
    readonly contentId = `platform-section-content-${nextId++}`;

    toggle(): void {
        this.expanded.update(expanded => !expanded);
    }
}
