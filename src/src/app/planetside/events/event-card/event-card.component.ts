import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-event-card',
    templateUrl: './event-card.template.html',
    styleUrls: ['./event-card.styles.css']
})

export class EventCardComponent {
    @Input('event') event: any;

    isActiveEvent(): boolean {
        let now = new Date();
        return new Date(this.event.endDate) > now;
    }
}