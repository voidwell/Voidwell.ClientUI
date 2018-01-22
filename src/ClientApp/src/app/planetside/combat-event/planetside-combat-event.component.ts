import { Component } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Component({
    templateUrl: './planetside-combat-event.template.html'
})

export class PlanetsideCombatEventComponent {
    public event: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public activeEvent: any = null;
}