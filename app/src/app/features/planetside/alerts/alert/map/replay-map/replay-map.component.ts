import { ChangeDetectorRef, Input, Component, OnInit, OnDestroy, EventEmitter, effect, inject, input, signal } from '@angular/core';
import { Observable, Subscription, interval} from 'rxjs';
import { ZoneRegionOwnership } from '@core/api/models/ps2/map.model';
import { CaptureLogRow } from '@core/api/models/ps2/combat-report.model';
import { FacilityEvent, Ps2ZoneMapComponent } from '../../../../components/ps2-zone-map/ps2-zone-map.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FactionBarComponent } from '../../../../components/faction-bar/faction-bar.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { toDate } from '@shared/utils/date';

@Component({
    selector: 'zone-replay-map',
    templateUrl: './replay-map.component.html',
    styleUrls: ['./replay-map.component.css'],
    imports: [Ps2ZoneMapComponent, MatButton, MatIcon, FactionBarComponent, MatMenuTrigger, MatMenu, MatMenuItem, DatePipe]
})

export class ReplayMapComponent implements OnInit, OnDestroy {
    @Input() zoneId: number;
    readonly ownership = input<ZoneRegionOwnership[] | null>(null);
    @Input() focusFacility: Observable<number | string>;
    @Input() focusTimestamp: Observable<string>;
    @Input() timeline: CaptureLogRow[];
    @Input({ transform: toDate }) start: Date;
    @Input({ transform: toDate }) end: Date;

    replayTime: Date
    isPlaying: boolean = false;
    replayScore: number[] = [0, 0, 0, 0];
    originalOwnership: ZoneRegionOwnership[];
    replayCaptureSub: EventEmitter<FacilityEvent> = new EventEmitter<FacilityEvent>();
    replayDefendSub: EventEmitter<FacilityEvent> = new EventEmitter<FacilityEvent>();
    /** What the map shows; changed by replaying and reset to the original ownership. */
    readonly zoneOwnership = signal<ZoneRegionOwnership[] | null>(null);

    timestampStreamSub: Subscription;

    tickSub: Subscription;
    tickSpeed: number = 100;
    tickMultiplier: number = 100;
    multipliers = [50, 100, 200];

    private cdr = inject(ChangeDetectorRef);

    progressWidth = 0;
    seekHoverWidth = 0;

    constructor() {
        effect(() => {
            const ownership = this.ownership();
            if (!ownership) {
                return;
            }

            this.originalOwnership = ownership.slice();
            this.zoneOwnership.set(ownership);
        });
    }

    ngOnInit() {
        if (this.focusTimestamp) {
            this.timestampStreamSub = this.focusTimestamp.subscribe(timestamp => {
                if (!timestamp) return;

                this.seekToTime(new Date(timestamp));
                this.cdr.markForCheck();
            });
        }

        if (this.start && this.end) {
            this.start = new Date(this.start);
            this.end = new Date(this.end);
            this.replayTime = this.start;
        }
    }

    onScoreChange(newScore: number[]) {
        setTimeout(() => {
            this.replayScore = newScore;
            this.cdr.markForCheck();
        }, 50);
    }

    togglePlaying() {
        this.isPlaying = !this.isPlaying;

        if (this.replayTime.getTime() >= this.end.getTime()) {
            this.replayTime = this.start;
            // a fresh array, so the map applies it again
            this.zoneOwnership.set([...this.originalOwnership]);
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

        const duration = this.end.getTime() - this.start.getTime();
        const elapsed = this.end.getTime() - seekTime.getTime()
        this.progressWidth = 100 - (elapsed / duration * 100);

        this.updateMapForTime(this.replayTime, seekTime);
        this.replayTime = seekTime;
    }

    getElapsed(): string {
        const elapsed = this.replayTime.getTime() - this.start.getTime();
        return this.getTimeSpanString(elapsed);
    }

    getDuration() {
        const duration = this.end.getTime() - this.start.getTime();
        return this.getTimeSpanString(duration);
    }

    onSeekClick(event: MouseEvent) {
        const xPos = event.offsetX;
        const width = (event.currentTarget as HTMLElement).offsetWidth;

        const seekDiff = (this.end.getTime() - this.start.getTime()) * (xPos / width);
        const seekTime = new Date(this.start.getTime() + seekDiff);

        this.seekToTime(seekTime);
    }

    onSeekHover(event: MouseEvent) {
        const xPos = event.offsetX;
        const width = (event.currentTarget as HTMLElement).offsetWidth;
        this.seekHoverWidth = xPos / width * 100;
    }

    private tock() {
        const newTime = new Date(this.replayTime.getTime() + (this.tickSpeed * this.tickMultiplier));
        this.seekToTime(newTime);
        this.cdr.markForCheck();
    }

    private getTimeSpanString(ms: number): string {
        const minutes = Math.floor(ms / 60000) % 60000;
        ms -= minutes * 60000;

        const seconds = Math.floor(ms / 1000) % 1000;

        return minutes + ':' + ("00" + seconds).substr(-2, 2);
    }

    private updateMapForTime(start: Date, end: Date) {
        const reverse = end.getTime() < start.getTime();
        const upperTime = reverse ? start : end;
        const lowerTime = reverse ? end : start;

        const sortedTimeline = this.timeline.sort(function (a, b) { return new Date(reverse ? b.timestamp : a.timestamp).getTime() - new Date(reverse ? a.timestamp : b.timestamp).getTime() });

        sortedTimeline.forEach(t => {
            const ts = new Date(t.timestamp).getTime();
            if (ts >= lowerTime.getTime() && ts <= upperTime.getTime()) {
                const captureData: FacilityEvent = {
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
        if (this.timestampStreamSub) this.timestampStreamSub.unsubscribe();
        if (this.tickSub) this.tickSub.unsubscribe();
    }
}