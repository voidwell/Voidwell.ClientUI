import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { Breadcrumb, BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { CombatEventHeaderComponent, CombatEventHeaderView } from '../combat-event/combat-event-header.component';
import { CombatEventSkeletonComponent } from './combat-event-skeleton.component';

/**
 * The frame of an alert or event: its breadcrumbs, header card and the page under it. While it loads the pages are
 * kept out of sight behind a skeleton, so they can set their breadcrumb and draw as soon as the event arrives.
 */
@Component({
    selector: 'combat-event-page',
    templateUrl: './combat-event-page.component.html',
    imports: [ErrorCardComponent, BreadcrumbsComponent, CombatEventHeaderComponent, CombatEventSkeletonComponent, RouterOutlet]
})
export class CombatEventPageComponent {
    readonly header = input<CombatEventHeaderView | null>(null);
    readonly crumbs = input<Breadcrumb[]>([]);
    readonly loading = input(true);
    readonly errorMessage = input<string | null>(null);
    /** Whether the page under it is the overview, which has more cards to hold a place for than the full pages. */
    readonly overview = input(true);
}
