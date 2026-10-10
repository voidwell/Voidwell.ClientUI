import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { CombatReportClassStats, CombatReportParticipantStats } from '@core/api/models/ps2/combat-report.model';
import { WorldActivity } from '@core/api/models/ps2/world.model';
import { AlertView } from '../../../components/alert-card/alert-view';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { AlertCardComponent } from '../../../components/alert-card/alert-card.component';
import { ActivityPopulationCardComponent } from './activity-population-card/activity-population-card.component';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { NgClass, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgArrayPipesModule } from 'ngx-pipes';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { WorldActivityExperienceFactions, WorldActivityExperienceItem } from '@core/api/models/ps2/world.model';

/** A top player with the derived figures the activity table shows. */
export interface TopPlayerView extends Omit<CombatReportParticipantStats, 'loginDate' | 'logoutDate'> {
    loginDate: Date | null;
    logoutDate: Date;
    kdr: number;
    hsr: number;
    isOnline: boolean;
    kpm: number;
    sessionKpm?: number;
    playTime: string;
}

export interface ActivityView extends Omit<WorldActivity, 'activityPeriodStart' | 'activityPeriodEnd' | 'topPlayers'> {
    activityPeriodStart: Date;
    activityPeriodEnd: Date;
    topPlayers: TopPlayerView[];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-world-activity.component.html',
    styleUrls: ['./planetside-world-activity.component.css'],
    imports: [LoaderComponent, AlertCardComponent, ActivityPopulationCardComponent, MatCard, MatCardTitle, MatCardContent, NgClass, RouterLink, DecimalPipe, NgArrayPipesModule, DgcImageUrlPipe, FactionColorPipe]
})

export class PlanetsideWorldActivityComponent {
    private parent = inject(PlanetsideWorldComponent);

    activity: ActivityView;
    alerts: AlertView[];
    isLoading: boolean = false;

    vsClasses: CombatReportClassStats[];
    ncClasses: CombatReportClassStats[];
    trClasses: CombatReportClassStats[];
    nsClasses: CombatReportClassStats[];

    objectKeys = Object.keys;

    constructor() {
        this.isLoading = true;

        effect(() => {
            const activity = this.parent.activity();

            untracked(() => {
                if (!activity) {
                    return;
                }

                const periodStart = new Date(activity.activityPeriodStart);
                const periodEnd = new Date(activity.activityPeriodEnd);
                const activityDurationMinutes = (periodEnd.getTime() - periodStart.getTime()) / (60000);

                this.vsClasses = activity.classStats.filter(t => t.profile.factionId === 1);
                this.ncClasses = activity.classStats.filter(t => t.profile.factionId === 2);
                this.trClasses = activity.classStats.filter(t => t.profile.factionId === 3);
                this.nsClasses = activity.classStats.filter(t => t.profile.factionId === 4);

                this.activity = {
                    ...activity,
                    activityPeriodStart: periodStart,
                    activityPeriodEnd: periodEnd,
                    topPlayers: activity.topPlayers.map(player => this.toTopPlayerView(player, activityDurationMinutes))
                };

                this.isLoading = false;
            });
        });

        effect(() => {
            const alerts = this.parent.alerts();

            untracked(() => {
                if (alerts === null) {
                    return;
                }

                this.alerts = alerts;
            });
        });
    }

    private toTopPlayerView(player: CombatReportParticipantStats, activityDurationMinutes: number): TopPlayerView {
        const loginDate = player.loginDate ? new Date(player.loginDate) : null;
        const logoutDate = player.logoutDate ? new Date(player.logoutDate) : new Date();
        const sessionDurationMs = loginDate ? logoutDate.getTime() - loginDate.getTime() : null;

        return {
            ...player,
            kdr: player.kills / (player.deaths > 0 ? player.deaths : 1),
            hsr: player.headshots / (player.kills > 0 ? player.kills : 1) * 100,
            isOnline: !!player.logoutDate,
            loginDate,
            logoutDate,
            kpm: player.kills / activityDurationMinutes,
            sessionKpm: player.sessionKills > 0 ? player.sessionKills / (sessionDurationMs / 60000) : undefined,
            playTime: this.formatTimespan(sessionDurationMs)
        };
    }

    /** Top experience earners of one stat, per faction. */
    experience(stat: string): WorldActivityExperienceFactions {
        return (this.activity.topExperience as unknown as Record<string, WorldActivityExperienceFactions>)[stat];
    }

    experiencePlayers(stat: string, faction: string): WorldActivityExperienceItem[] {
        return (this.experience(stat) as unknown as Record<string, WorldActivityExperienceItem[]>)[faction];
    }

    formatName(value: string) {
        return value.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
    }

    formatTimespan(timespan: number) {
        if (!timespan) {
            return "";
        }

        const hours = Math.floor(timespan / 36e5);
        const minutes = Math.floor((timespan % 36e5) / 60000);

        let result = "";
        if (hours > 0) {
            result += `${hours}${hours > 1 ? "hrs" : "h"} `
        }

        return result + `${minutes}mins`;
    }

}
