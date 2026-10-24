import { ChangeDetectorRef, Component, inject, signal, effect, input, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { throwError, of } from "rxjs";
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { WeaponInfoRepository } from '@core/api/ps2/weapon-info.repository';
import { WeaponInfoResult } from '@core/api/models/ps2/weapon.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { ItemCardComponent } from './item-card/item-card.component';
import { Breadcrumb, BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';

@Component({
    templateUrl: './planetside-item.component.html',
    styleUrls: ['./planetside-item.component.css'],
    imports: [LoaderComponent, ErrorCardComponent, BreadcrumbsComponent, ItemCardComponent, RouterOutlet]
})

export class PlanetsideItemComponent {
    private weaponInfoRepository = inject(WeaponInfoRepository);
    private cdr = inject(ChangeDetectorRef);
    readonly id = input<string>();

    errorMessage: string = null;
    readonly isLoading = signal(true);

    readonly itemId = signal<string | null>(null);
    /** `itemId` as a stream, for the leaderboard's table data source. */
    readonly itemId$ = toObservable(this.itemId);
    readonly weaponData = signal<WeaponInfoResult | null>(null);
    /** Where the current page sits under the weapon, shown above the item card; each page sets its own. */
    readonly breadcrumbs = signal<Breadcrumb[]>([]);

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.errorMessage = null;
                this.itemId.set(id);
                this.weaponData.set(null);
                this.isLoading.set(true);

                this.weaponInfoRepository.getWeaponInfo(id)
                    .pipe(
                        catchError(error => {
                            if (error.status === 404) {
                                return of();
                            }
                            this.errorMessage = error.statusText;
                            return throwError(() => error);
                        }),
                        finalize(() => {
                            this.isLoading.set(false);
                            this.cdr.markForCheck();
                        })
                    )
                    .subscribe(data => {
                        this.weaponData.set(data);
                    });
            });
        });
    }

}