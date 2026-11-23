import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { HeroAnalyticsRepository } from '@core/api/deadlock/hero-analytics.repository';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { DeadlockItemsTableComponent } from '../../components/items-table/deadlock-items-table.component';
import { deadlockResource } from '../../data/deadlock-resource';
import { DeadlockHeroContext } from '../deadlock-hero-context.service';

@Component({
    templateUrl: './deadlock-hero-items.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, LoaderComponent, ErrorCardComponent, DeadlockItemsTableComponent]
})
export class DeadlockHeroItemsComponent {
    private readonly repository = inject(HeroAnalyticsRepository);

    private readonly hero = inject(DeadlockHeroContext);

    readonly items = deadlockResource((query, id: number) => this.repository.getItems(id, query), () => this.hero.heroId());
}
