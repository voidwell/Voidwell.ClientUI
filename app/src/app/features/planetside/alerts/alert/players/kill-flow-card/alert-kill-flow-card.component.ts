import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { CombatReportFactionKills } from '@core/api/models/ps2/combat-report.model';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { FactionCodePipe } from '../../../../pipes/faction-code.pipe';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { buildKillFlow } from './kill-flow';

type KillFlowMode = 'kills' | 'share';

/** Each faction's colour as RGB, for the bars and the cell tints. */
const FACTION_RGB: Record<number, string> = {
    1: '143, 69, 187',
    2: '21, 101, 192',
    3: '198, 40, 40',
    4: '130, 132, 134'
};

/** Who killed whom between the factions of an alert: head-to-head pairs and a killer-by-victim grid. */
@Component({
    selector: 'alert-kill-flow-card',
    templateUrl: './alert-kill-flow-card.component.html',
    styleUrls: ['./alert-kill-flow-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, ChipsComponent, DecimalPipe, PercentPipe, NgClass, FactionCodePipe, FactionColorPipe]
})
export class AlertKillFlowCardComponent {
    readonly kills = input.required<readonly CombatReportFactionKills[]>();

    readonly mode = signal<KillFlowMode>('kills');
    readonly modeOptions: ChipOption<KillFlowMode>[] = [
        { value: 'kills', label: 'Kills' },
        { value: 'share', label: 'Share' }
    ];

    readonly flow = computed(() => buildKillFlow(this.kills()));

    fill(factionId: number): string {
        return `rgb(${FACTION_RGB[factionId] ?? FACTION_RGB[4]})`;
    }

    /** A faint tint of the killer's colour, stronger for the larger counts. */
    tint(factionId: number, weight: number): string {
        return `rgba(${FACTION_RGB[factionId] ?? FACTION_RGB[4]}, ${(.08 + .32 * weight).toFixed(2)})`;
    }
}
