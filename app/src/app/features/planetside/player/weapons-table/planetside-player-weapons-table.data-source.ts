import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { compareSortValues, SortValue } from '@shared/utils/sort';
import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';

export class PlayerWeaponsDataSource extends DataSource<CharacterDetailsWeaponStat> {
    constructor(private data: CharacterDetailsWeaponStat[], private sort: MatSort) {
        super();
    }

    connect(): Observable<CharacterDetailsWeaponStat[]> {
        const first = of(this.data);
        return merge(first, this.sort.sortChange).pipe(map(() => {
            return this.getSortedData();
        }));
    }

    getSortedData() {
        const data = this.data;
        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let f: (p: CharacterDetailsWeaponStat) => SortValue;

            switch (this.sort.active) {
                case 'name': f = p => p.name; break;
                case 'kills': f = p => p.stats.kills; break;
                case 'vehicleKills': f = p => p.stats.vehicleKills; break;
                case 'deaths': f = p => p.stats.deaths; break;
                case 'kdr': f = p => p.stats.kills / p.stats.deaths; break;
                case 'kdrDelta': f = p => p.stats.killDeathRatioDelta || -1000; break;
                case 'accuracy': f = p => p.stats.hitCount / p.stats.fireCount; break;
                case 'accuracyDelta': f = p => p.stats.accuracyDelta || -1000; break;
                case 'hsr': f = p => p.stats.headshots / p.stats.kills; break;
                case 'hsrDelta': f = p => p.stats.hsrDelta || -1000; break;
                case 'kph': f = p => p.stats.kills / (p.stats.playTime / 3600); break;
                case 'kphDelta': f = p => p.stats.kphDelta || -1000; break;
                case 'vehicleKph': f = p => p.stats.vehicleKills / (p.stats.playTime / 3600); break;
                case 'vehicleKphDelta': f = p => p.stats.vehicleKphDelta || -1000; break;
                case 'spm': f = p => p.stats.score / (p.stats.playTime / 60); break;
                case 'time': f = p => p.stats.playTime / 3600; break;
                case 'lpk': f = p => p.stats.hitCount / p.stats.kills; break;
                case 'spk': f = p => p.stats.fireCount / p.stats.kills; break;
            }

            const propertyA: SortValue = f(a);
            const propertyB: SortValue = f(b);

            return compareSortValues(propertyA, propertyB, this.sort.direction);
        });
    }

    disconnect() { }
}
