import { Component, OnDestroy } from '@angular/core';
import { PlanetsideWorldComponent } from './../planetside-world.component';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './planetside-world-activity.template.html',
    styleUrls: ['./planetside-world-activity.styles.css']
})

export class PlanetsideWorldActivityComponent implements OnDestroy {
    activity: any;
    worldState: any;

    vsClasses: any[];
    ncClasses: any[];
    trClasses: any[];
    nsClasses: any[];

    activitySub: Subscription;
    worldStateSub: Subscription;

    objectKeys = Object.keys;

    constructor(private parent: PlanetsideWorldComponent) {
        this.activitySub = this.parent.getActivity()
            .subscribe(activity => {
                this.activity = activity;
                
                this.vsClasses = this.activity.classStats.filter(t => t.profile.factionId === 1);
                this.ncClasses = this.activity.classStats.filter(t => t.profile.factionId === 2);
                this.trClasses = this.activity.classStats.filter(t => t.profile.factionId === 3);
                this.nsClasses = this.activity.classStats.filter(t => t.profile.factionId === 4);
            });

        this.worldStateSub = this.parent.getWorldState()
            .subscribe(worldState => {
                this.worldState = worldState;
            });
    }

    formatName(value: string) {
        return value.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
    }

    ngOnDestroy() {
        this.activitySub.unsubscribe();
        this.worldStateSub.unsubscribe();
    }
}