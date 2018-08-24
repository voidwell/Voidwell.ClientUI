import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, throwError, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    templateUrl: './player-ranks.template.html',
    styleUrls: ['./player-ranks.styles.css']
})

export class PlayerRanksComponent implements OnInit {
    isLoading: boolean;
    errorMessage: string = null;

    playerRankings: any[] = [];
    dataSource: TableDataSource;

    constructor(private api: PlanetsideApi) {
        
    }

    ngOnInit() {
        this.isLoading = true;

        this.api.getPlayerRanks()
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body || error.statusText
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(data => {
                this.playerRankings = data;
                this.dataSource = new TableDataSource(this.playerRankings);
            });
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        return of(this.data);
    }

    disconnect() { }
}