import { Component, computed, inject } from '@angular/core';
import { WorldActivity } from '@core/api/models/ps2/world.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { ActivityAlertsCardComponent } from './activity-alerts-card/activity-alerts-card.component';
import { ActivityClassesCardComponent } from './activity-classes-card/activity-classes-card.component';
import { ActivityFactionsCardComponent } from './activity-factions-card/activity-factions-card.component';
import { ActivityOutfitsCardComponent } from './activity-outfits-card/activity-outfits-card.component';
import { ActivityPlayersCardComponent } from './activity-players-card/activity-players-card.component';
import { ActivityPopulationCardComponent } from './activity-population-card/activity-population-card.component';
import { ActivityVehiclesCardComponent } from './activity-vehicles-card/activity-vehicles-card.component';
import { ActivityWeaponsCardComponent } from './activity-weapons-card/activity-weapons-card.component';
import { topOutfitRows, topPlayerRows } from './activity-figures';

export type ActivityView = Omit<WorldActivity, 'activityPeriodStart' | 'activityPeriodEnd'> & {
    activityPeriodStart: Date;
    activityPeriodEnd: Date;
};

@Component({
    templateUrl: './planetside-world-activity.component.html',
    imports: [
        LoaderComponent, ActivityAlertsCardComponent, ActivityPopulationCardComponent, ActivityFactionsCardComponent, ActivityClassesCardComponent,
        ActivityPlayersCardComponent, ActivityOutfitsCardComponent, ActivityWeaponsCardComponent, ActivityVehiclesCardComponent
    ]
})
export class PlanetsideWorldActivityComponent {
    private parent = inject(PlanetsideWorldComponent);

    /** The world's activity over the last hour, refreshed by the world page; `null` while loading. */
    readonly activity = computed<ActivityView | null>(() => {
        const activity = this.parent.activity();
        if (!activity) {
            return null;
        }

        return {
            ...activity,
            activityPeriodStart: new Date(activity.activityPeriodStart),
            activityPeriodEnd: new Date(activity.activityPeriodEnd)
        };
    });

    readonly alerts = computed(() => this.parent.alerts() ?? []);

    readonly players = computed(() => {
        const activity = this.activity();
        const minutes = activity ? (activity.activityPeriodEnd.getTime() - activity.activityPeriodStart.getTime()) / 60000 : 0;
        return topPlayerRows(activity?.topPlayers, minutes);
    });

    readonly outfits = computed(() => topOutfitRows(this.activity()?.topOutfits));
}
