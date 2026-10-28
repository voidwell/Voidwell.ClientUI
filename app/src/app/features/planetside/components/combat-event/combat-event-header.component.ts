import { Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { MatCard, MatCardFooter } from '@angular/material/card';
import { NavLink } from '@shared/ui/nav-link.model';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';
import { FactionNamePipe } from '../../pipes/faction-name.pipe';
import { zoneImageUrl } from '../zone-image/zone-image';
import { AlertIndicatorComponent } from '../alert-indicator/alert-indicator.component';

/** Each faction's score, as a percentage. */
export interface FactionScores {
    vs: number;
    nc: number;
    tr: number;
}

/** One faction's tile: its score and how it moved. */
export interface ScoreTile {
    factionId: number;
    score: number;
    /** The change since the start, or `null` when the start is not known. */
    change: number | null;
    started: number | null;
}

/** The change in a score as "+5", "−2" or "±0". */
export function formatChange(change: number): string {
    const rounded = Math.round(change);
    return rounded > 0 ? `+${rounded}` : rounded < 0 ? `−${Math.abs(rounded)}` : '±0';
}

/**
 * The header card of an alert or event: its name, where and when it ran, the factions' scores and the tabs of its
 * combat report. While it runs it shows the time left, with an alarm for an alert.
 */
@Component({
    selector: 'combat-event-header',
    templateUrl: './combat-event-header.component.html',
    styleUrls: ['./combat-event-header.component.css'],
    imports: [MatCard, MatCardFooter, NgClass, DatePipe, DecimalPipe, VWCountdownComponent, VWTabNavSubBarComponent, AlertIndicatorComponent, FactionColorPipe, FactionNamePipe]
})
export class CombatEventHeaderComponent {
    readonly title = input.required<string>();
    readonly subtitle = input('');
    readonly description = input('');
    readonly start = input.required<Date>();
    /** When it ended, or is due to end. */
    readonly end = input.required<Date>();
    readonly scores = input<FactionScores | null>(null);
    /** The scores at the start, for the change on each tile. */
    readonly startScores = input<FactionScores | null>(null);
    /** Shows an alarm beside the time left, for an alert. */
    readonly alarm = input(false);
    /** Gives the end its own tile, for an event. */
    readonly showEnd = input(false);
    readonly tabs = input<NavLink[]>([]);
    /** The continent it happened on, for the artwork behind the header. */
    readonly zoneId = input<number | string | null>(null);

    readonly art = computed(() => zoneImageUrl(this.zoneId()));

    readonly running = computed(() => this.end().getTime() > Date.now());
    readonly durationMinutes = computed(() => Math.round((this.end().getTime() - this.start().getTime()) / 60000));

    readonly tiles = computed<ScoreTile[]>(() => {
        const scores = this.scores();
        if (!scores) {
            return [];
        }

        const started = this.startScores();
        return ([['vs', 1], ['nc', 2], ['tr', 3]] as const).map(([key, factionId]) => ({
            factionId,
            score: scores[key],
            started: started ? started[key] : null,
            change: started ? scores[key] - started[key] : null
        }));
    });

    readonly formatChange = formatChange;
}
