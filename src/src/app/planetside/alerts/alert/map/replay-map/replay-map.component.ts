import { Input, Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription, BehaviorSubject, interval} from 'rxjs';

@Component({
    selector: 'zone-replay-map',
    templateUrl: './replay-map.template.html',
    styleUrls: ['./replay-map.styles.css']
})

export class ReplayMapComponent implements OnInit, OnDestroy {
    @Input() zoneId: string;
    @Input() ownershipStream: Observable<any>;
    @Input() focusFacility: Observable<any>;
    @Input() focusTimestamp: Observable<any>;
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
    timestampStreamSub: Subscription;

    tickSub: Subscription;
    tickSpeed: number = 100;
    tickMultiplier: number = 100;
    multipliers = [50, 100, 200];

    progressWidth = 0;
    seekHoverWidth = 0;

    ngOnInit() {
        if (this.ownershipStream) {
            this.ownershipStreamSub = this.ownershipStream.subscribe(ownership => {
                if (!ownership) return;

                this.originalOwnership = ownership.slice();
                this.ownershipSub.next(ownership);
            });
        }

        if (this.focusTimestamp) {
            this.timestampStreamSub = this.focusTimestamp.subscribe(timestamp => {
                if (!timestamp) return;

                this.seekToTime(new Date(timestamp));
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

    seekToTime(seekTime: Date) {
        if (seekTime.getTime() >= this.end.getTime()) {
            seekTime = this.end;
            this.isPlaying = false;
            if (this.tickSub) {
                this.tickSub.unsubscribe();
            }
        }

        let duration = this.end.getTime() - this.start.getTime();
        let elapsed = this.end.getTime() - seekTime.getTime()
        this.progressWidth = 100 - (elapsed / duration * 100);

        this.updateMapForTime(this.replayTime, seekTime);
        this.replayTime = seekTime;
    }

    getElapsed(): string {
        let elapsed = this.replayTime.getTime() - this.start.getTime();
        return this.getTimeSpanString(elapsed);
    }

    getDuration() {
        let duration = this.end.getTime() - this.start.getTime();
        return this.getTimeSpanString(duration);
    }

    onSeekClick(event) {
        let xPos = event.offsetX;
        let width = event.path[0].offsetWidth;

        let seekDiff = (this.end.getTime() - this.start.getTime()) * (xPos / width);
        let seekTime = new Date(this.start.getTime() + seekDiff);

        this.seekToTime(seekTime);
    }

    onSeekHover(event) {
        let xPos = event.offsetX;
        let width = event.path[0].offsetWidth;
        this.seekHoverWidth = xPos / width * 100;
    }

    private tock() {
        let newTime = new Date(this.replayTime.getTime() + (this.tickSpeed * this.tickMultiplier));
        this.seekToTime(newTime);
    }

    private getTimeSpanString(ms: number): string {
        let minutes = Math.floor(ms / 60000) % 60000;
        ms -= minutes * 60000;

        let seconds = Math.floor(ms / 1000) % 1000;

        return minutes + ':' + ("00" + seconds).substr(-2, 2);
    }

    private updateMapForTime(start: Date, end: Date) {
        let reverse = end.getTime() < start.getTime();
        let upperTime = reverse ? start : end;
        let lowerTime = reverse ? end : start;

        let sortedTimeline = this.timeline.sort(function (a, b) { return new Date(reverse ? b.timestamp : a.timestamp).getTime() - new Date(reverse ? a.timestamp : b.timestamp).getTime() });

        sortedTimeline.forEach(t => {
            let ts = new Date(t.timestamp).getTime();
            if (ts >= lowerTime.getTime() && ts <= upperTime.getTime()) {
                let captureData = {
                    timestamp: t.timestamp,
                    zoneId: this.zoneId,
                    facilityId: t.mapRegion.id,
                    factionId: reverse ? t.oldFactionId : t.newFactionId
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
        if (this.timestampStreamSub) this.timestampStreamSub.unsubscribe();
        if (this.tickSub) this.tickSub.unsubscribe();
    }
}