import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, of, merge, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsideItemComponent } from './planetside-item.component';
import { MatSort } from '@angular/material/sort';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { WeaponLeaderboardRow } from '@core/api/models/ps2/weapon.model';

export class ItemLeaderboardDataSource extends DataSource<WeaponLeaderboardRow> {
    private itemSubject = new BehaviorSubject<WeaponLeaderboardRow[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    private itemId: string;

    constructor(private leaderboardRepository: LeaderboardRepository, private sort: MatSort, private paginator: MatPaginator, private itemComponent: PlanetsideItemComponent) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<WeaponLeaderboardRow[]> {
        merge(this.itemComponent.itemId$, this.sort.sortChange, this.paginator.page).subscribe(() => {
            this.itemId = this.itemComponent.itemId();
            this.loadItems();
        })

        return this.itemSubject.asObservable();
    }

    disconnect() {
        this.itemSubject.complete();
        this.loadingSubject.complete();
    }

    loadItems() {
        if (this.itemId === '' || this.itemId === undefined) {
            return;
        }
        
        this.loadingSubject.next(true);

        this.leaderboardRepository.getWeaponLeaderboard(this.itemId, this.paginator.pageIndex, this.sort.active, this.sort.direction)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(results => {
                this.itemSubject.next(results)
            });
    }
}
