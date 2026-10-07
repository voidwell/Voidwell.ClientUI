import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { RatingCharacter } from '@core/api/models/ps2/reference.model';

export class PlayerRanksDataSource extends DataSource<RatingCharacter> {
    constructor(private data: RatingCharacter[]) {
        super();
    }

    connect(): Observable<RatingCharacter[]> {
        return of(this.data);
    }

    disconnect() { }
}
