import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { DamageChartComponent } from './damage-chart/damage-chart.component';
import { TopPlayersCardComponent } from './top-players-card/top-players-card.component';
import { roundsPerMinute, shotsToKill, timeToKill } from './weapon-figures';

/** The weapon's overview: its specifications, damage by range, accuracy and top players. */
@Component({
    templateUrl: './planetside-item-stats.component.html',
    styleUrls: ['./planetside-item-stats.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, DamageChartComponent, TopPlayersCardComponent]
})
export class PlanetsideItemStatsComponent {
    private itemComponent = inject(PlanetsideItemComponent);

    readonly weaponData = this.itemComponent.weaponData;
    readonly itemId = this.itemComponent.itemId;

    /** Figures worked out from the weapon's stats; only infantry weapons have the damage and accuracy to show. */
    readonly figures = computed(() => {
        const weapon = this.weaponData();
        if (!weapon) {
            return null;
        }
        const infantry = !weapon.isVehicleWeapon;
        return {
            rpm: roundsPerMinute(weapon.fireRateMs),
            hasDamage: infantry && !!weapon.maxDamage,
            hasAccuracy: infantry && !!weapon.hipAcc && !!weapon.aimAcc,
            shotsToKill: [shotsToKill(weapon.maxDamage), shotsToKill(weapon.minDamage)],
            timeToKill: [timeToKill(weapon.maxDamage, weapon.fireRateMs), timeToKill(weapon.minDamage, weapon.fireRateMs)]
        };
    });

    constructor() {
        this.itemComponent.breadcrumbs.set([{ label: 'Overview' }]);
    }

    /** A low–high range as text, or the one value when both ends match. */
    span(range: (number | null)[], unit = ''): string {
        const [near, far] = range;
        if (near == null || far == null) {
            return '—';
        }
        return (near === far ? `${near}` : `${near}–${far}`) + unit;
    }
}
