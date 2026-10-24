import { Component, computed, inject } from '@angular/core';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { CombatVehiclesCardComponent } from '../../../components/combat-report/combat-vehicles-card/combat-vehicles-card.component';

/** The vehicles of an alert or event by their kills. */
@Component({
    template: '<combat-vehicles-card [vehicles]="vehicles()"></combat-vehicles-card>',
    imports: [CombatVehiclesCardComponent]
})
export class PlanetsideAlertVehiclesComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    readonly vehicles = computed(() => this.parentEventComponent.event()?.log?.stats?.vehicles);
}
