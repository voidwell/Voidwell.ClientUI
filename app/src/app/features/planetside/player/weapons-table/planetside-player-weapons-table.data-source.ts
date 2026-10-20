import { DataSource } from '@angular/cdk/collections';
import { signal } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
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

/** The grade (delta from the average) behind each graded column; the third and fourth clicks sort by it. */
const GRADE_VALUES: Record<string, (weapon: CharacterDetailsWeaponStat) => number | undefined> = {
    kdr: weapon => weapon.stats.killDeathRatioDelta,
    accuracy: weapon => weapon.stats.accuracyDelta,
    hsr: weapon => weapon.stats.hsrDelta,
    kph: weapon => weapon.stats.kphDelta,
    vehicleKph: weapon => weapon.stats.vehicleKphDelta
};

/**
 * The weapons table's rows, sorted by its sort header; the rows change as its filters do.
 *
 * A graded column cycles through four sorts: its figure high to low, low to high, then its grade best to worst and
 * worst to best. Weapons without a grade sort last either way.
 */
export class PlayerWeaponsDataSource extends DataSource<CharacterDetailsWeaponStat> {
    private readonly rows = new BehaviorSubject<CharacterDetailsWeaponStat[]>([]);

    /** The column sorted by grade rather than by figure, if any. */
    readonly gradeSort = signal<string | null>(null);
    private previous: Sort;
    private readonly subscription: Subscription;

    constructor(private sort: MatSort) {
        super();
        this.previous = { active: sort.active, direction: sort.direction };
        // Subscribed before connect() so the grade mode is settled before the rows are sorted.
        this.subscription = sort.sortChange.subscribe(change => this.onSortChange(change));
    }

    setRows(rows: CharacterDetailsWeaponStat[]): void {
        this.rows.next(rows);
    }

    connect(): Observable<CharacterDetailsWeaponStat[]> {
        return combineLatest([this.rows, this.sort.sortChange.pipe(startWith(null))]).pipe(
            map(([rows]) => this.sorted(rows)));
    }

    disconnect() {
        this.subscription.unsubscribe();
    }

    private onSortChange(change: Sort): void {
        const wrapped = change.active === this.previous.active && this.previous.direction === 'asc' && change.direction === 'desc';
        if (change.active !== this.previous.active) {
            this.gradeSort.set(null);
        } else if (wrapped && GRADE_VALUES[change.active]) {
            this.gradeSort.update(column => (column ? null : change.active));
        }
        this.previous = change;
    }

    private sorted(rows: CharacterDetailsWeaponStat[]): CharacterDetailsWeaponStat[] {
        const grade = this.gradeSort() ? GRADE_VALUES[this.sort.active] : undefined;
        if (grade) {
            return [...rows].sort((a, b) => {
                const gradeA = grade(a), gradeB = grade(b);
                if (gradeA == null || gradeB == null) {
                    return (gradeA == null ? 1 : 0) - (gradeB == null ? 1 : 0);
                }
                return compareSortValues(gradeA, gradeB, this.sort.direction);
            });
        }

        const value = SORT_VALUES[this.sort.active];
        if (!value || !this.sort.direction) {
            return rows;
        }
        return [...rows].sort((a, b) => compareSortValues(value(a), value(b), this.sort.direction));
    }
}
