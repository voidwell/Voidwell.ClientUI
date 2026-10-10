import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortable, MatSortHeader } from '@angular/material/sort';
import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { GradeComponent } from '../../components/vw-grade/vw-grade.component';
import { DecimalPipe } from '@angular/common';
import { PlayerWeaponsDataSource } from './planetside-player-weapons-table.data-source';

@Component({
    selector: 'planetside-player-weapons-table',
    templateUrl: './planetside-player-weapons-table.component.html',
    styleUrls: ['./planetside-player-weapons-table.component.css'],
    imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, RouterLink, GradeComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DecimalPipe]
})

export class PlanetsidePlayerWeaponsTableComponent implements OnInit {
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @Input() weapons: CharacterDetailsWeaponStat[];

    dataSource: PlayerWeaponsDataSource;

    ngOnInit() {
        this.sort.sort(<MatSortable>{
            id: 'kills',
            start: 'desc'
        });

        const weapons = this.weapons.filter(item => item.stats.kills > 0);
        this.dataSource = new PlayerWeaponsDataSource(weapons, this.sort);
    }

    private getPercentToAurax(kills: number) {
        const percent = kills / 1160 * 100;
        return (percent > 100 ? 100 : percent) + '%';
    }
}

