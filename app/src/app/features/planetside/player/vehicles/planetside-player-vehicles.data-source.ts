import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { VehicleInfo } from '@core/api/models/ps2/reference.model';
import { CharacterDetailsVehicleStat } from '@core/api/models/ps2/character.model';

/** A vehicle of the player's faction together with the player's stats for it. */
export type VehicleRow = VehicleInfo & { stats: Partial<CharacterDetailsVehicleStat> };

export class VehiclesDataSource extends DataSource<VehicleRow> {
    constructor(private data: VehicleRow[]) {
        super();
    }

    connect(): Observable<VehicleRow[]> {
        return of(this.data);
    }

    disconnect() { }
}
