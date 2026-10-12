import { Component, inject } from '@angular/core';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { PlanetsidePlayerStatsOverviewCardComponent } from './overview-card/planetside-player-stats-overview-card.component';
import { PlanetsidePlayerStatsOutfitCardComponent } from './outfit-card/planetside-player-stats-outfit-card.component';
import { PlanetsidePlayerStatsSiegeCardComponent } from './siege-card/planetside-player-stats-siege-card.component';
import { PlanetsidePlayerStatsKdrCardComponent } from './kdr-card/planetside-player-stats-kdr-card.component';
import { PlanetsidePlayerStatsWeaponsCardComponent } from './weapons-card/planetside-player-stats-weapons-card.component';
import { PlanetsidePlayerStatsIviCardComponent } from './ivi-card/planetside-player-stats-ivi-card.component';

@Component({
    templateUrl: './planetside-player-stats.component.html',
    imports: [
        LoaderComponent,
        PlanetsidePlayerStatsOverviewCardComponent,
        PlanetsidePlayerStatsOutfitCardComponent,
        PlanetsidePlayerStatsSiegeCardComponent,
        PlanetsidePlayerStatsKdrCardComponent,
        PlanetsidePlayerStatsWeaponsCardComponent,
        PlanetsidePlayerStatsIviCardComponent
    ]
})

export class PlanetsidePlayerStatsComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly player = this.planetsidePlayer.playerData;
}
