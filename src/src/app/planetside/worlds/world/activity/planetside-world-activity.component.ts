import { Component, OnDestroy } from '@angular/core';
import { PlanetsideWorldComponent } from './../planetside-world.component';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './planetside-world-activity.template.html',
    styleUrls: ['./planetside-world-activity.styles.css']
})

export class PlanetsideWorldActivityComponent implements OnDestroy {
    activity: any;
    alerts: any;
    isLoading: boolean = false;

    vsClasses: any[];
    ncClasses: any[];
    trClasses: any[];
    nsClasses: any[];

    activitySub: Subscription;
    alertsSub: Subscription;

    objectKeys = Object.keys;

    constructor(private parent: PlanetsideWorldComponent) {
        let self = this;
        this.isLoading = true;

        this.activitySub = this.parent.getActivity()
            .subscribe(activity => {
                if (!activity) {
                    return;
                }
                
                this.activity = activity;
                
                this.activity.activityPeriodStart = new Date(this.activity.activityPeriodStart);
                this.activity.activityPeriodEnd = new Date(this.activity.activityPeriodEnd);
                let activityDurationMinutes = (this.activity.activityPeriodEnd - this.activity.activityPeriodStart) / (60000);

                this.vsClasses = this.activity.classStats.filter(t => t.profile.factionId === 1);
                this.ncClasses = this.activity.classStats.filter(t => t.profile.factionId === 2);
                this.trClasses = this.activity.classStats.filter(t => t.profile.factionId === 3);
                this.nsClasses = this.activity.classStats.filter(t => t.profile.factionId === 4);

                this.activity.topPlayers.map(function(player) {
                    player.kdr = player.kills / (player.deaths > 0 ? player.deaths : 1);
                    player.hsr = player.headshots / (player.kills > 0 ? player.kills : 1) * 100;
                    player.isOnline = !!player.logoutDate;
                    player.loginDate = player.loginDate ? new Date(player.loginDate) : null;
                    player.logoutDate = player.logoutDate ? new Date(player.logoutDate) : new Date();
                    player.kpm = player.kills / activityDurationMinutes;

                    let sessionDurationMs = player.loginDate ? player.logoutDate - player.loginDate : null;

                    if (player.sessionKills && player.sessionKills > 0) {
                        player.sessionKpm = player.sessionKills / (sessionDurationMs / 60000);
                    }

                    player.playTime = self.formatTimespan(sessionDurationMs);
                });

                this.isLoading = false;
            });
        
        this.alertsSub = this.parent.getAlerts()
            .subscribe(alerts => {
                if (alerts === null) {
                    return;
                }

                this.alerts = alerts;
            });
    }

    formatName(value: string) {
        return value.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
    }

    formatTimespan(timespan: number) {
        if (!timespan) {
            return "";
        }

        let hours = Math.floor(timespan / 36e5);
        let minutes = Math.floor((timespan % 36e5) / 60000);

        let result = "";
        if (hours > 0) {
            result += `${hours}${hours > 1 ? "hrs" : "h"} `
        }
        
        return result += `${minutes}mins`;
    }

    ngOnDestroy() {
        this.activitySub.unsubscribe();
        this.alertsSub.unsubscribe();
    }
}