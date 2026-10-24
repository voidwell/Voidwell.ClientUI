import { Component, computed, inject } from '@angular/core';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { CombatWeaponsCardComponent } from '../../../components/combat-report/combat-weapons-card/combat-weapons-card.component';

/** The weapons of an alert or event by their kills. */
@Component({
    template: '<combat-weapons-card [weapons]="weapons()"></combat-weapons-card>',
    imports: [CombatWeaponsCardComponent]
})
export class PlanetsideAlertWeaponsComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    readonly weapons = computed(() => this.parentEventComponent.event()?.log?.stats?.weapons);
}
