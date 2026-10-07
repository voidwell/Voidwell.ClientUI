import { Component, signal } from '@angular/core';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';

/** Anything with a combat report: a custom event or an alert. */
export type CombatEvent = CustomEventDetails | AlertResult;

@Component({ templateUrl: './planetside-combat-event.component.html' })

export class PlanetsideCombatEventComponent<T extends CombatEvent = CombatEvent> {
    /** The loaded event or alert; `null` while loading. */
    readonly event = signal<T | null>(null);

    get activeEvent(): T | null {
        return this.event();
    }
}