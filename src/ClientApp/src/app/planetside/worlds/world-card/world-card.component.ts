import { Component, Input } from '@angular/core';

@Component({
    selector: 'world-card',
    templateUrl: './world-card.template.html',
    styleUrls: ['./world-card.styles.css']
})

export class WorldCardComponent {
    @Input() world: any;
}