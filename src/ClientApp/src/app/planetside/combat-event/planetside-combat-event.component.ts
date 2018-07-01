import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    templateUrl: './planetside-combat-event.template.html'
})

export class PlanetsideCombatEventComponent {
    public event: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public activeEvent: any = null;

    public getBackgroundColor(mapId: string): string {
        switch (mapId.toString()) {
            case '2': // Indar
                return '#292b18';
            case '4': // Hossin
                return '#292b18';
            case '6': // Amerish
                return '#182b23';
            case '8': // Esamir
                return '#364c54';
        }

        return '#1e282e';
    }
}