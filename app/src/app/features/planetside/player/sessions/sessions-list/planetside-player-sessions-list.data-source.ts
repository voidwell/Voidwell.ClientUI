import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { PlayerSessionSummary } from '@core/api/models/ps2/character.model';

export class SessionsDataSource extends DataSource<PlayerSessionSummary> {
    constructor(private data: PlayerSessionSummary[]) {
        super();
    }

    connect(): Observable<PlayerSessionSummary[]> {
        return of(this.data);
    }

    disconnect() { }
}
