import { Component, computed, inject } from '@angular/core';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { CombatVehiclesCardComponent } from '../../../components/combat-report/combat-vehicles-card/combat-vehicles-card.component';
import { CombatWeaponsCardComponent } from '../../../components/combat-report/combat-weapons-card/combat-weapons-card.component';
import { combatOutfitRows, combatPlayerRows } from '../../../components/combat-report/combat-report-figures';
import { AlertKillFlowCardComponent } from './kill-flow-card/alert-kill-flow-card.component';
import { AlertReplayCardComponent } from './replay-card/alert-replay-card.component';
import { AlertTopOutfitsCardComponent } from './top-outfits-card/alert-top-outfits-card.component';
import { AlertTopPlayersCardComponent } from './top-players-card/alert-top-players-card.component';

/** The summary of an alert or event: its kill flow, best players, outfits, weapons and vehicles, and its map, each linking on to the full list. */
@Component({
    templateUrl: './planetside-alert-overview.component.html',
    imports: [AlertKillFlowCardComponent, AlertTopPlayersCardComponent, AlertTopOutfitsCardComponent, AlertReplayCardComponent, CombatWeaponsCardComponent, CombatVehiclesCardComponent]
})
export class PlanetsideAlertOverviewComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    private readonly stats = computed(() => this.parentEventComponent.event()?.log?.stats);

    readonly players = computed(() => combatPlayerRows(this.stats()?.participants));
    readonly outfits = computed(() => combatOutfitRows(this.stats()?.outfits));
    readonly weapons = computed(() => this.stats()?.weapons);
    readonly vehicles = computed(() => this.stats()?.vehicles);
    /** Kills by faction pair, or null when the report has none (older API responses). */
    readonly factionKills = computed(() => {
        const kills = this.stats()?.factionKills;
        return kills?.length ? kills : null;
    });

    constructor() {
        this.parentEventComponent.section.set(null);
    }
}
