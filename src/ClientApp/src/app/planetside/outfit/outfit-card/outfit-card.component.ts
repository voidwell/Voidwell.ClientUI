import { Component, Input } from '@angular/core';

@Component({
    selector: 'outfit-card',
    templateUrl: './outfit-card.template.html',
    styleUrls: ['./outfit-card.styles.css']
})

export class OutfitCardComponent {
    @Input('data') outfitData: any;
}