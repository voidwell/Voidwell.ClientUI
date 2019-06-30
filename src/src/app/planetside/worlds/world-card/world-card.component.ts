import { Component, Input } from '@angular/core';

@Component({
    selector: 'world-card',
    templateUrl: './world-card.template.html',
    styleUrls: ['./world-card.styles.css']
})

export class WorldCardComponent {
    @Input() world: any;

    getMinutes(value) : number {
        let now = new Date();
        let valueDate = new Date(value);
        let diffMs = (now.getTime() - valueDate.getTime());
        return Math.round((diffMs / 1000) / 60);
    }
}