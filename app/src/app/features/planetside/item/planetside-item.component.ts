import { Component, inject, signal, effect, input, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { throwError, of } from "rxjs";
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { WeaponInfoRepository } from '@core/api/ps2/weapon-info.repository';
import { WeaponInfoResult } from '@core/api/models/ps2/weapon.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { ItemCardComponent } from './item-card/item-card.component';

@Component({
    templateUrl: './planetside-item.component.html',
    styleUrls: ['./planetside-item.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, ItemCardComponent, RouterOutlet]
})

export class PlanetsideItemComponent {
    private weaponInfoRepository = inject(WeaponInfoRepository);
    readonly id = input<string>();

    errorMessage: string = null;
    isLoading: boolean = true;

    readonly itemId = signal<string | null>(null);
    /** `itemId` as a stream, for the leaderboard's table data source. */
    readonly itemId$ = toObservable(this.itemId);
    readonly weaponData = signal<WeaponInfoResult | null>(null);

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.errorMessage = null;
                this.itemId.set(id);
                this.weaponData.set(null);
                this.isLoading = true;

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
                            this.isLoading = false;
                        })
                    )
                    .subscribe(data => {
                        this.weaponData.set(data);
                    });
            });
        });
    }

}