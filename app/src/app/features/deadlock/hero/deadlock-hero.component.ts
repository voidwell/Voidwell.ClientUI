import { Component, computed, effect, inject, input } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { NavLink } from '@shared/ui/nav-link.model';
import { Breadcrumb, BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { formatPercent, titleCase } from '../data/deadlock-figures';
import { DeadlockHeroContext } from './deadlock-hero-context.service';

@Component({
    templateUrl: './deadlock-hero.component.html',
    providers: [DeadlockHeroContext],
    imports: [MatCard, RouterOutlet, DecimalPipe, PercentPipe, LoaderComponent, ErrorCardComponent, BreadcrumbsComponent, VWTabNavSubBarComponent]
})
export class DeadlockHeroComponent {
    readonly context = inject(DeadlockHeroContext);

    /** The hero id, from the route. */
    readonly id = input<string>();

    readonly formatPercent = formatPercent;
    readonly titleCase = titleCase;

    readonly navLinks: NavLink[] = [
        { path: 'overview', display: 'Overview', icon: 'mdi-chart-line' },
        { path: 'items', display: 'Items', icon: 'mdi-shopping' },
        { path: 'builds', display: 'Builds', icon: 'mdi-hammer-wrench' },
        { path: 'matchups', display: 'Matchups', icon: 'mdi-sword-cross' },
        { path: 'progression', display: 'Progression', icon: 'mdi-trending-up' }
    ];

    readonly breadcrumbs = computed<Breadcrumb[]>(() => [
        { label: 'Heroes', link: '/deadlock/heroes' },
        { label: this.context.detail.value()?.hero.name ?? this.context.info.value()?.name ?? 'Hero' }
    ]);

    constructor() {
        effect(() => {
            const id = Number(this.id());
            this.context.heroId.set(Number.isInteger(id) ? id : undefined);
        });
    }
}
