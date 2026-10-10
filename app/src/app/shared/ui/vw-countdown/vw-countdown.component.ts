import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { toDate } from '@shared/utils/date';

@Component({
    selector: 'vw-countdown',
    template: '<span>{{remaining}}</span>'
})

export class VWCountdownComponent implements OnInit {
    @Input({ transform: toDate }) end: Date;

    private cdr = inject(ChangeDetectorRef);
    private diff: number;
    public remaining: string;

    private hms() {
        let t = this.diff;

        if (t < 0) {
            return '0 Hours 0 Minutes 0 Seconds';
        }

        const hours = Math.floor(t / 3600);
        t -= hours * 3600;

        const minutes = Math.floor(t / 60) % 60;
        t -= minutes * 60;

        const seconds = t % 60;

        const returnTime = [];
        if (hours > 0) {
            returnTime.push(hours + ' Hours');
        }
        if (minutes > 0) {
            returnTime.push(minutes + ' Minutes');
        }

        returnTime.push(seconds + ' Seconds');

        return returnTime.join(' ');
    }

    private tock() {
        this.diff = Math.floor((this.end.getTime() - new Date().getTime()) / 1000);
    }

    ngOnInit() {
        this.tock();
        this.remaining = this.hms();

        const tick = interval(1000).pipe(map((x) => {
            this.tock();
        })).subscribe((x) => {
            this.remaining = this.hms();
            this.cdr.markForCheck();

            if (this.diff < 0) {
                tick.unsubscribe();
            }
        });
    }
}