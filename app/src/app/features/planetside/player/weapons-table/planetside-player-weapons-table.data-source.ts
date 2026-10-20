import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { compareSortValues, SortValue } from '@shared/utils/sort';
import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { perHour, perMinute, ratio } from '../stat-math';

/**
 * How each sortable column orders the weapons. A figure that cannot be worked out (K/D of a weapon whose deaths the
 * game does not count, such as grenades and orbital strikes) sorts as 0.
 */
const SORT_VALUES: Record<string, (weapon: CharacterDetailsWeaponStat) => SortValue> = {
    name: weapon => weapon.name,
    kills: weapon => weapon.stats.kills,
    vehicleKills: weapon => weapon.stats.vehicleKills,
    deaths: weapon => weapon.stats.deaths,
    kdr: weapon => ratio(weapon.stats.kills, weapon.stats.deaths),
    accuracy: weapon => ratio(weapon.stats.hitCount, weapon.stats.fireCount),
    hsr: weapon => ratio(weapon.stats.headshots, weapon.stats.kills),
    kph: weapon => perHour(weapon.stats.kills, weapon.stats.playTime),
    vehicleKph: weapon => perHour(weapon.stats.vehicleKills, weapon.stats.playTime),
    spm: weapon => perMinute(weapon.stats.score, weapon.stats.playTime),
    time: weapon => weapon.stats.playTime,
    lpk: weapon => ratio(weapon.stats.hitCount, weapon.stats.kills),
    spk: weapon => ratio(weapon.stats.fireCount, weapon.stats.kills)
};

/** The weapons table's rows, sorted by its sort header; the rows change as its filters do. */
export class PlayerWeaponsDataSource extends DataSource<CharacterDetailsWeaponStat> {
    private readonly rows = new BehaviorSubject<CharacterDetailsWeaponStat[]>([]);

    constructor(private sort: MatSort) {
        super();
    }

    setRows(rows: CharacterDetailsWeaponStat[]): void {
        this.rows.next(rows);
    }

    connect(): Observable<CharacterDetailsWeaponStat[]> {
        return combineLatest([this.rows, this.sort.sortChange.pipe(startWith(null))]).pipe(
            map(([rows]) => this.sorted(rows)));
    }

    disconnect() { }

    private sorted(rows: CharacterDetailsWeaponStat[]): CharacterDetailsWeaponStat[] {
        const value = SORT_VALUES[this.sort.active];
        if (!value || !this.sort.direction) {
            return rows;
        }
        return [...rows].sort((a, b) => compareSortValues(value(a), value(b), this.sort.direction));
    }
}
