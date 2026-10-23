import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** One step of a breadcrumb trail. `link` is the step's page; the current page has none. */
export interface Breadcrumb {
    label: string;
    link?: string;
}

/** Where a page sits in its area, as links back up: a strip for the foot of a header card. */
@Component({
    selector: 'vw-breadcrumbs',
    templateUrl: './vw-breadcrumbs.component.html',
    styleUrls: ['./vw-breadcrumbs.component.css'],
    imports: [RouterLink]
})
export class BreadcrumbsComponent {
    readonly crumbs = input.required<Breadcrumb[]>();
}
