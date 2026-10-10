import { Component, ChangeDetectionStrategy, OnInit, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { PlanetsideItemComponent } from './planetside-item.component';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatCard, MatCardFooter } from '@angular/material/card';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { GradeComponent } from '../components/vw-grade/vw-grade.component';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { ItemLeaderboardDataSource } from './planetside-item-leaderboard.data-source';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-item-leaderboard.component.html',
    styleUrls: ['./planetside-item-leaderboard.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatCard, MatCardFooter, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, RouterLink, NgClass, MatSortHeader, GradeComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, AsyncPipe, DecimalPipe, FactionColorPipe]
})

export class PlanetsideItemLeaderboardComponent implements OnInit {
    private itemComponent = inject(PlanetsideItemComponent);
    private leaderboardRepository = inject(LeaderboardRepository);

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    errorMessage: string = null;
    weaponDataSub: Subscription;

    public dataSource: ItemLeaderboardDataSource;

    ngOnInit() {
        this.dataSource = new ItemLeaderboardDataSource(this.leaderboardRepository, this.sort, this.paginator, this.itemComponent);
    }
}

