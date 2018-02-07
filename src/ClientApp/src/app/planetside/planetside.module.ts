import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { NgPipesModule } from 'ngx-pipes';
import { D3Service } from 'd3-ng2-service';
import { MaterialLib } from '../shared/materialLib.module';
import { VoidwellPipesModule } from '../shared/pipes/voidwellpipes.modules';
import { WorldNamePipe } from '../shared/pipes/ps2/world-name.pipe';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { routing } from './planetside.routes';
import { PlanetsideApi } from './planetside-api.service';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideCombatEventComponent } from './combat-event/planetside-combat-event.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';
import { PlanetsideItemStatsComponent } from './item/planetside-item-stats.component';
import { PlanetsideItemLeaderboardComponent } from './item/planetside-item-leaderboard.component';
import { PlanetsideItemDamageCardComponent } from './item/damage-card/planetside-item-damage-card.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';
import { PlanetsidePlayerStatsComponent } from './player/stats/planetside-player-stats.component';
import { PlanetsidePlayerStatsSiegeCardComponent } from './player/stats/siege-card/planetside-player-stats-siege-card.component';
import { PlanetsidePlayerClassesComponent } from './player/classes/planetside-player-classes.component';
import { PlanetsidePlayerVehiclesComponent } from './player/vehicles/planetside-player-vehicles.component';
import { PlanetsidePlayerWeaponsComponent } from './player/weapons/planetside-player-weapons.component';
import { PlanetsidePlayerWeaponsTableComponent } from './player/weapons-table/planetside-player-weapons-table.component';
import { PlanetsidePlayerSessionsListComponent } from './player/sessions/sessions-list/planetside-player-sessions-list.component';
import { PlanetsidePlayerSessionComponent } from './player/sessions/session/planetside-player-session.component';
import { PlanetsideOutfitComponent } from './outfit/planetside-outfit.component';
import { PlanetsideAlertsListComponent } from './alerts/alerts-list/planetside-alerts-list.component';
import { PlanetsideAlertComponent } from './alerts/alert/planetside-alert.component';
import { PlanetsideAlertPlayersComponent } from './alerts/alert/players/planetside-alert-players.component';
import { PlanetsideAlertOutfitsComponent } from './alerts/alert/outfits/planetside-alert-outfits.component';
import { PlanetsideAlertWeaponsComponent } from './alerts/alert/weapons/planetside-alert-weapons.component';
import { PlanetsideAlertVehiclesComponent } from './alerts/alert/vehicles/planetside-alert-vehicles.component';
import { PlanetsideAlertMapComponent } from './alerts/alert/map/planetside-alert-map.component';
import { PlanetsideEventsListComponent } from './events/events-list/planetside-events-list.component';
import { PlanetsideEventComponent } from './events/event/planetside-event.component';
import { PlanetsideWorldWrapperComponent } from './worlds/planetside-world-wrapper.component';
import { PlanetsideWorldComponent } from './worlds/world/planetside-world.component';
import { PlanetsideWorldPlayersComponent } from './worlds/world/players/planetside-world-players.component';

@NgModule({
    declarations: [
        PlanetsideWrapperComponent,
        PlanetsideCombatEventComponent,
        PlanetsideNewsComponent,
        PlanetsideItemComponent,
        PlanetsideItemStatsComponent,
        PlanetsideItemLeaderboardComponent,
        PlanetsideItemDamageCardComponent,
        PlanetsidePlayerComponent,
        PlanetsidePlayerStatsComponent,
        PlanetsidePlayerStatsSiegeCardComponent,
        PlanetsidePlayerClassesComponent,
        PlanetsidePlayerVehiclesComponent,
        PlanetsidePlayerWeaponsComponent,
        PlanetsidePlayerWeaponsTableComponent,
        PlanetsidePlayerSessionsListComponent,
        PlanetsidePlayerSessionComponent,
        PlanetsideOutfitComponent,
        PlanetsideAlertsListComponent,
        PlanetsideAlertComponent,
        PlanetsideAlertPlayersComponent,
        PlanetsideAlertOutfitsComponent,
        PlanetsideAlertWeaponsComponent,
        PlanetsideAlertVehiclesComponent,
        PlanetsideAlertMapComponent,
        PlanetsideEventsListComponent,
        PlanetsideEventComponent,
        PlanetsideWorldWrapperComponent,
        PlanetsideWorldComponent,
        PlanetsideWorldPlayersComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialLib,
        CommonModule,
        VoidwellPipesModule,
        SharedComponentsModule,
        routing,
        NgPipesModule
    ],
    providers: [
        PlanetsideApi,
        DecimalPipe,
        DatePipe,
        D3Service,
        WorldNamePipe
    ],
    entryComponents: [PlanetsideWrapperComponent]
})
export class PlanetsideModule { }
