import { Component, Input } from '@angular/core';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { NgClass, DatePipe } from '@angular/common';
import { MatCard, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { VWCountdownComponent } from '@shared/ui/vw-countdown/vw-countdown.component';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgArrayPipesModule } from 'ngx-pipes';
import { ZoneNamePipe } from '../../pipes/zone-name.pipe';

@Component({
    selector: 'vw-event-card',
    templateUrl: './event-card.component.html',
    styleUrls: ['./event-card.component.css'],
    imports: [NgClass, MatCard, MatCardTitle, VWCountdownComponent, MatCardSubtitle, MatButton, RouterLink, DatePipe, NgArrayPipesModule, ZoneNamePipe]
})

export class EventCardComponent {
    @Input() event: CustomEvent;

    isActiveEvent(): boolean {
        const now = new Date();
        return new Date(this.event.endDate) > now;
    }
}