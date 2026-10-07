import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { PlayerSessionEvent } from '@core/api/models/ps2/character.model';

export class SessionDataSource extends DataSource<PlayerSessionEvent> {
    constructor(private data: PlayerSessionEvent[]) {
        super();
    }

    connect(): Observable<PlayerSessionEvent[]> {
        return of(this.data);
    }

    disconnect() { }
}
