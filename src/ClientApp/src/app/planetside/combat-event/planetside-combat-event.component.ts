import { Component, OnDestroy, Inject } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { HeaderService, HeaderConfig } from '../../shared/services/header.service';

@Component({
    templateUrl: './planetside-combat-event.template.html'
})

export class PlanetsideCombatEventComponent implements OnDestroy {
    public event: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public activeEvent: any = null;

    constructor(private eventHeaderService: HeaderService) {
    }

    public setupHeader(title: string, description: string, zoneId: string) {
        let headerConfig = new HeaderConfig();
        headerConfig.title = title;
        headerConfig.subtitle = description;

        switch (zoneId) {
            case '2': // Indar
                headerConfig.background = '#292b18';
                break;
            case '4': // Hossin
                headerConfig.background = '#292b18';
                break;
            case '6': // Amerish
                headerConfig.background = '#182b23';
                break;
            case '8': // Esamir
                headerConfig.background = '#364c54';
                break;
            default:
                headerConfig.background = '#1e282e';
        }

        this.eventHeaderService.setHeaderConfig(headerConfig);
    }

    ngOnDestroy() {
        this.eventHeaderService.reset();
    }
}