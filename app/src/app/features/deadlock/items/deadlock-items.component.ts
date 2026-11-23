import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { ItemAnalyticsRepository } from '@core/api/deadlock/item-analytics.repository';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { DeadlockItemsTableComponent } from '../components/items-table/deadlock-items-table.component';
import { deadlockResource } from '../data/deadlock-resource';

@Component({
    templateUrl: './deadlock-items.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, LoaderComponent, ErrorCardComponent, DeadlockItemsTableComponent]
})
export class DeadlockItemsComponent {
    private readonly repository = inject(ItemAnalyticsRepository);

    readonly items = deadlockResource(query => this.repository.getItemStats(query));
}
