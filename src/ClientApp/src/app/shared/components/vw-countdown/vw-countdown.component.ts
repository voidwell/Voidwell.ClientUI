import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'vw-countdown',
    template: '<span>{{remaining}}</span>'
})

export class VWCountdownComponent implements OnInit {
    @Input() end: Date;

    private diff: number;
    public remaining: string;

    private hms() {
        let t = this.diff;

        if (t < 0) {
            return '0 Hours 0 Minutes 0 Seconds';
        }

        let hours = Math.floor(t / 3600);
        t -= hours * 3600;

        let minutes = Math.floor(t / 60) % 60;
        t -= minutes * 60;

        let seconds = t % 60;

        return [hours + ' Hours', minutes + ' Minutes', seconds + ' Seconds'].join(' ');
    }

    private tock() {
        this.diff = Math.floor((this.end.getTime() - new Date().getTime()) / 1000);
    }

    ngOnInit() {
        this.tock();
        this.remaining = this.hms();

        let tick = Observable.interval(1000).map((x) => {
            this.tock();
        }).subscribe((x) => {
            this.remaining = this.hms();

            if (this.diff < 0) {
                tick.unsubscribe();
            }
        });
    }
}