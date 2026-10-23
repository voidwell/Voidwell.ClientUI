import { Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { formatNumber } from '@angular/common';
import { WeaponInfoResult } from '@core/api/models/ps2/weapon.model';

const WIDTH = 520;
const HEIGHT = 200;
const PAD = { left: 40, right: 16, top: 24, bottom: 28 };

interface Point { x: number; y: number; }

/** Damage per shot by range: full damage up to the drop-off start, falling to the minimum at its end. */
@Component({
    selector: 'item-damage-chart',
    templateUrl: './damage-chart.component.html',
    styleUrls: ['./damage-chart.component.css']
})
export class DamageChartComponent {
    private locale = inject(LOCALE_ID);

    readonly weapon = input.required<WeaponInfoResult>();

    readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
    readonly left = PAD.left;
    readonly right = WIDTH - PAD.right;
    readonly top = PAD.top;
    readonly bottom = HEIGHT - PAD.bottom;
    readonly height = HEIGHT;

    readonly chart = computed(() => {
        const w = this.weapon();
        const maxDamage = w.maxDamage ?? 0;
        const minDamage = w.minDamage ?? maxDamage;
        const near = w.maxDamageRange ?? 0;
        const far = Math.max(w.minDamageRange ?? near, near);

        const maxRange = Math.ceil(Math.max(100, far + 20) / 20) * 20;
        const yMin = Math.floor(minDamage * 0.8 / 10) * 10;
        const yMax = Math.max(Math.ceil(maxDamage * 1.08 / 10) * 10, yMin + 10);

        const x = (range: number) => PAD.left + range / maxRange * (WIDTH - PAD.left - PAD.right);
        const y = (damage: number) => PAD.top + (1 - (damage - yMin) / (yMax - yMin)) * (HEIGHT - PAD.top - PAD.bottom);
        const at = (range: number, damage: number): Point => ({ x: x(range), y: y(damage) });

        const line = [at(0, maxDamage), at(near, maxDamage), at(far, minDamage), at(maxRange, minDamage)];
        const points = line.map(p => `${p.x},${p.y}`).join(' ');
        const n = (value: number) => formatNumber(value, this.locale);
        const label = (point: Point, text: string) => ({ ...point, text, anchor: point.x > WIDTH * 0.7 ? 'end' : 'start' });

        return {
            points,
            area: `${x(0)},${y(yMin)} ${points} ${x(maxRange)},${y(yMin)}`,
            xTicks: Array.from({ length: maxRange / 20 + 1 }, (_, i) => i * 20).map(range => ({ x: x(range), label: range === maxRange ? `${range} m` : `${range}` })),
            yTicks: [yMin, Math.round((yMin + yMax) / 2), yMax].map(damage => ({ y: y(damage), label: `${damage}` })),
            marks: minDamage === maxDamage
                ? [label(at(near, maxDamage), `${n(maxDamage)} at every range`)]
                : [label(at(near, maxDamage), `${n(maxDamage)} up to ${near} m`), label(at(far, minDamage), `${n(minDamage)} from ${far} m`)]
        };
    });
}
