import { Component, computed, effect, input, signal, viewChild } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { GradeComponent } from '../../components/vw-grade/vw-grade.component';
import { PlanetsideStatTileComponent } from '../stat-tile/planetside-stat-tile.component';
import { hours, perHour, perMinute, ratio } from '../stat-math';
import { PlayerWeaponsDataSource } from './planetside-player-weapons-table.data-source';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';

/** Kills that earn a weapon its Auraxium medal. */
export const AURAXIUM_KILLS = 1160;

/** Lists longer than this get a search box and an infantry / vehicle filter. */
const FILTER_THRESHOLD = 15;

export type WeaponKind = 'all' | 'infantry' | 'vehicle';

/** A player's weapons with kills, sortable, each row opening to the rest of its stats. */
@Component({
    selector: 'planetside-player-weapons-table',
    templateUrl: './planetside-player-weapons-table.component.html',
    styleUrls: ['./planetside-player-weapons-table.component.css'],
    imports: [
        ChipsComponent, MatTable, MatSort, MatSortHeader, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
        MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatIcon, RouterLink,
        GradeComponent, PlanetsideStatTileComponent, NgTemplateOutlet, DecimalPipe, PercentPipe
    ]
})
export class PlanetsidePlayerWeaponsTableComponent {
    readonly weapons = input.required<CharacterDetailsWeaponStat[]>();

    readonly columns = ['name', 'kills', 'vehicleKills', 'deaths', 'kdr', 'accuracy', 'hsr', 'kph', 'vehicleKph', 'spm', 'time', 'lpk', 'spk', 'expand'];

    readonly ratio = ratio;
    readonly perHour = perHour;
    readonly perMinute = perMinute;
    readonly hours = hours;
    readonly auraxiumKills = AURAXIUM_KILLS;

    readonly search = signal('');
    readonly kind = signal<WeaponKind>('all');
    readonly kindOptions: ChipOption<WeaponKind>[] = [{ value: 'all', label: 'All' }, { value: 'infantry', label: 'Infantry' }, { value: 'vehicle', label: 'Vehicle' }];
    /** The weapon whose row is open, by item id. */
    readonly expanded = signal<number | null>(null);

    /** The weapons the player has killed with; the ones the table can show. */
    private readonly used = computed(() => this.weapons().filter(weapon => (weapon.stats?.kills ?? 0) > 0));

    readonly filterable = computed(() => this.used().length > FILTER_THRESHOLD);

    readonly rows = computed(() => {
        const search = this.search().trim().toLowerCase();
        const kind = this.kind();
        return this.used().filter(weapon =>
            (kind === 'all' || (kind === 'vehicle') === !!weapon.vehicleId) &&
            (!search || (weapon.name ?? '').toLowerCase().includes(search) || (weapon.category ?? '').toLowerCase().includes(search)));
    });

    private readonly sort = viewChild.required(MatSort);
    readonly dataSource = computed(() => new PlayerWeaponsDataSource(this.sort()));

    constructor() {
        effect(() => this.dataSource().setRows(this.rows()));
    }

    toggle(weapon: CharacterDetailsWeaponStat): void {
        this.expanded.update(id => (id === weapon.itemId ? null : weapon.itemId));
    }

    onSearch(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value);
    }

    /** Progress towards the Auraxium medal, 0–1. */
    auraxiumProgress(weapon: CharacterDetailsWeaponStat): number {
        return Math.min(1, (weapon.stats.kills ?? 0) / AURAXIUM_KILLS);
    }
}
