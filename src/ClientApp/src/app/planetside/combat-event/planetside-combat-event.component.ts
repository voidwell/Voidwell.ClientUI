import { Component, OnDestroy, Inject } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
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
                headerConfig.background = '#421c0a';
                break;
            case '4': // Hossin
                headerConfig.background = '#2a3f0d';
                break;
            case '6': // Amerish
                headerConfig.background = '#0a421c';
                break;
            case '8': // Esamir
                headerConfig.background = '#10393c';
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