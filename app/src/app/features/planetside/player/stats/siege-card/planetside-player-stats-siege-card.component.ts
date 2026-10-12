import { Component, afterNextRender, computed, input, signal } from '@angular/core';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

/** How far captures can sit from defends, as a share of 100, before the player is called an attacker or defender. */
const BALANCED_MARGIN = 10;

@Component({
    selector: 'planetside-player-stats-siege-card',
    templateUrl: './planetside-player-stats-siege-card.component.html',
    styleUrls: ['./planetside-player-stats-siege-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, DecimalPipe]
})

export class PlanetsidePlayerStatsSiegeCardComponent {
    readonly captured = input.required<number>();
    readonly defended = input.required<number>();

    /** Captures as a percentage of defends. */
    readonly level = computed(() => this.captured() / this.defended() * 100);

    /** Position on the gauge, 0 (all defending) to 100 (all attacking). */
    readonly gaugeValue = computed(() => {
        const level = this.level();
        return Number.isFinite(level) ? Math.min(Math.max(level, 0), 100) : level > 0 ? 100 : 0;
    });

    readonly lean = computed(() => {
        const level = this.level();
        if (Number.isNaN(level) || Math.abs(level - 100) <= BALANCED_MARGIN) {
            return 'Balanced';
        }
        return level > 100 ? 'Attacker' : 'Defender';
    });

    /** Flips on after the first render so the gauge animates from empty. */
    readonly shown = signal(false);

    constructor() {
        afterNextRender(() => this.shown.set(true));
    }

    get siegeLevel(): number {
        return this.level();
    }
}
