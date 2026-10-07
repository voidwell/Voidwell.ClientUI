import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { Profile } from '@core/api/models/ps2/reference.model';
import { CharacterDetailsProfileStat } from '@core/api/models/ps2/character.model';

/** A class of the player's faction together with the player's stats for it. */
export type ProfileRow = Profile & { stats: Partial<CharacterDetailsProfileStat> };

export class ProfilesDataSource extends DataSource<ProfileRow> {
    constructor(private data: ProfileRow[]) {
        super();
    }

    connect(): Observable<ProfileRow[]> {
        return of(this.data);
    }

    disconnect() { }
}
