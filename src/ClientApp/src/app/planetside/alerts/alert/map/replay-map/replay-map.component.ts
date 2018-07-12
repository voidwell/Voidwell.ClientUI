import { Input, Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription, BehaviorSubject, interval} from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'zone-replay-map',
    templateUrl: './replay-map.template.html',
    styleUrls: ['./replay-map.styles.css']
})

export class ReplayMapComponent implements OnInit, OnDestroy {
    @Input() zoneId: string;
    @Input() ownershipStream: Observable<any>;
    @Input() focusFacility: Observable<any>;
    @Input() timeline: any[];
    @Input() start: Date;
    @Input() end: Date;

    replayTime: Date
    isPlaying: boolean = false;
    replayScore: any[] = [0, 0, 0, 0];
    originalOwnership: any;
    replayCaptureSub: EventEmitter<any> = new EventEmitter<any>();
    replayDefendSub: EventEmitter<any> = new EventEmitter<any>()
    ownershipSub: BehaviorSubject<any> = new BehaviorSubject(null);
    ownershipStreamSub: Subscription;

    tickSub: Subscription;
    tickSpeed: number = 100;
    tickMultiplier: number = 100;
    multipliers = [50, 100, 200];

    ngOnInit() {
        if (this.ownershipStream) {
            this.ownershipStreamSub = this.ownershipStream.subscribe(ownership => {
                if (!ownership) return;

                this.originalOwnership = ownership.slice();
                this.ownershipSub.next(ownership);
            });
        }

        if (this.start && this.end) {
            this.start = new Date(this.start);
            this.end = new Date(this.end);
            this.replayTime = this.start;
        }
    }

    onScoreChange(newScore) {
        setTimeout(() => { this.replayScore = newScore }, 50);
    }

    togglePlaying() {
        this.isPlaying = !this.isPlaying;

        if (this.replayTime.getTime() >= this.end.getTime()) {
            this.replayTime = this.start;
            this.ownershipSub.next(this.originalOwnership);
        }

        if (this.isPlaying) {
            this.tickSub = interval(this.tickSpeed).subscribe(() => this.tock());
        } else {
            this.tickSub.unsubscribe();
        }
    }

    skipBackward() {
        if (this.tickSub) {
            this.tickSub.unsubscribe();
        }
        this.isPlaying = false;
        this.replayTime = this.start;
        this.ownershipSub.next(this.originalOwnership);
    }

    skipForward() {
        if (this.tickSub) {
            this.tickSub.unsubscribe();
        }
        this.isPlaying = false;
        this.updateMapForTime(this.replayTime, this.end);
        this.replayTime = this.end;
    }

    getElapsed() {
        let elapsed = this.replayTime.getTime() - this.start.getTime();

        let minutes = Math.floor(elapsed / 60000) % 60000;
        elapsed -= minutes * 60000;

        let seconds = Math.floor(elapsed / 1000) % 1000;

        return minutes + ':' + ("00" + seconds).substr(-2, 2);
    }

    getProgress() {
        if (this.replayTime.getTime() >= this.end.getTime()) {
            return 100;
        }

        let duration = this.end.getTime() - this.start.getTime();
        let elapsed = this.end.getTime() - this.replayTime.getTime()
        return 100 - (elapsed / duration * 100);
    }

    onSeek(event) {
        let xPos = event.offsetX;
        let width = event.path[0].offsetWidth;

        this.ownershipSub.next(this.originalOwnership);

        let seekTime = (this.end.getTime() - this.start.getTime()) * (xPos / width);

        this.replayTime = new Date(this.start.getTime() + seekTime);

        let self = this;
        setTimeout(function () {
            self.updateMapForTime(self.start, self.replayTime);
        }, 50);
    }

    private tock() {
        let newTime = new Date(this.replayTime.getTime() + (this.tickSpeed * this.tickMultiplier));
        if (this.replayTime.getTime() >= this.end.getTime()) {
            this.tickSub.unsubscribe();
            this.replayTime = this.end;
            this.isPlaying = false;
        }

        this.updateMapForTime(this.replayTime, newTime);

        this.replayTime = newTime;
    }

    private updateMapForTime(start: Date, end: Date) {
        this.timeline.forEach(t => {
            let ts = new Date(t.timestamp).getTime();
            if (ts >= start.getTime() && ts <= end.getTime()) {
                let captureData = {
                    timestamp: t.timestamp,
                    zoneId: this.zoneId,
                    facilityId: t.mapRegion.id,
                    factionId: t.newFactionId
                };

                if (t.newFactionId === t.oldFactionId) {
                    this.replayDefendSub.emit(captureData);
                } else {
                    this.replayCaptureSub.emit(captureData);
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.ownershipStreamSub) this.ownershipStreamSub.unsubscribe();
        if (this.tickSub) this.tickSub.unsubscribe();
    }
}