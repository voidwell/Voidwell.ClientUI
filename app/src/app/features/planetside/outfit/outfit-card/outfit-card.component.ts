import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { OutfitDetails } from '@core/api/models/ps2/outfit.model';
import { FactionIconComponent } from '../../components/faction-icon/faction-icon.component';

@Component({
    selector: 'outfit-card',
    templateUrl: './outfit-card.component.html',
    styleUrls: ['./outfit-card.component.css'],
    imports: [MatCard, DatePipe, RouterLink, FactionIconComponent]
})
export class OutfitCardComponent {
    readonly data = input<OutfitDetails | null>();
}
