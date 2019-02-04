import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { NgPipesModule } from 'ngx-pipes';
import { D3Service } from 'd3-ng2-service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MaterialLib } from '../shared/materialLib.module';
import { RequestCache } from '../shared/services/request-cache.service';
import { VoidwellPipesModule } from '../shared/pipes/voidwellpipes.modules';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { routing } from './planetside.routes';
import { PlanetsideApi } from './shared/services/planetside-api.service';
import { PerformanceGrades } from './shared/services/performance-grades.service';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideSearchComponent } from './search/planetside-search.component';
import { PlanetsideCombatEventComponent } from './combat-event/planetside-combat-event.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { NewsCardComponent } from './news/news-card/news-card.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';
import { ItemCardComponent } from './item/item-card/item-card.component';
import { PlanetsideItemStatsComponent } from './item/planetside-item-stats.component';
import { PlanetsideItemLeaderboardComponent } from './item/planetside-item-leaderboard.component';
import { PlanetsideItemDamageCardComponent } from './item/damage-card/planetside-item-damage-card.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';
import { CharacterCardComponent } from './player/character-card/character-card.component';
import { PlanetsidePlayerStatsComponent } from './player/stats/planetside-player-stats.component';
import { PlanetsidePlayerStatsSiegeCardComponent } from './player/stats/siege-card/planetside-player-stats-siege-card.component';
import { StatsHistoryCardComponent } from './player/stats/stats-history-card/stats-history-card.component';
import { PlanetsidePlayerClassesComponent } from './player/classes/planetside-player-classes.component';
import { PlanetsidePlayerVehiclesComponent } from './player/vehicles/planetside-player-vehicles.component';
import { PlanetsidePlayerWeaponsComponent } from './player/weapons/planetside-player-weapons.component';
import { PlanetsidePlayerWeaponsTableComponent } from './player/weapons-table/planetside-player-weapons-table.component';
import { PlanetsidePlayerSessionsListComponent } from './player/sessions/sessions-list/planetside-player-sessions-list.component';
import { PlanetsidePlayerSessionComponent } from './player/sessions/session/planetside-player-session.component';
import { PlanetsideOutfitComponent } from './outfit/planetside-outfit.component';
import { OutfitCardComponent } from './outfit/outfit-card/outfit-card.component';
import { AlertCardComponent } from './alerts/alert-card/alert-card.component';
import { PlanetsideAlertsListComponent } from './alerts/alerts-list/planetside-alerts-list.component';
import { PlanetsideAlertComponent } from './alerts/alert/planetside-alert.component';
import { PlanetsideAlertPlayersComponent } from './alerts/alert/players/planetside-alert-players.component';
import { PlanetsideAlertOutfitsComponent } from './alerts/alert/outfits/planetside-alert-outfits.component';
import { PlanetsideAlertWeaponsComponent } from './alerts/alert/weapons/planetside-alert-weapons.component';
import { PlanetsideAlertVehiclesComponent } from './alerts/alert/vehicles/planetside-alert-vehicles.component';
import { PlanetsideAlertMapComponent } from './alerts/alert/map/planetside-alert-map.component';
import { ReplayMapComponent } from './alerts/alert/map/replay-map/replay-map.component';
import { EventCardComponent } from './events/event-card/event-card.component';
import { PlanetsideEventsListComponent } from './events/events-list/planetside-events-list.component';
import { PlanetsideEventComponent } from './events/event/planetside-event.component';
import { PlanetsideWorldWrapperComponent } from './worlds/planetside-world-wrapper.component';
import { PlanetsideWorldComponent } from './worlds/world/planetside-world.component';
import { WorldCardComponent } from './worlds/world-card/world-card.component';
import { PlanetsideWorldPlayersComponent } from './worlds/world/players/planetside-world-players.component';
import { PlanetsideWorldMapComponent } from './worlds/world/map/planetside-world-map.component';
import { PlanetsideWorldZoneComponent } from './worlds/world/map/zone/planetside-world-zone.component';
import { GradeComponent } from './shared/vw-grade/vw-grade.component';
import { FactionBarComponent } from './shared/faction-bar/faction-bar.component';
import { ZoneHelper } from './shared/services/zone-helper.service';
import { Ps2ZoneMapComponent } from './shared/ps2-zone-map/ps2-zone-map.component';
import { WeaponTrackerComponent } from './weapon-tracker/weapon-tracker.component';
import { PopulationComponent } from './population/population.component';
import { PlayerRanksComponent } from './player-ranks/player-ranks.component';
import { WorldService } from './shared/services/world-service.service';
import { ZoneService } from './shared/services/zone-service.service';
import { PlanetsidePipesModule } from './shared/pipes';
import { BulkCharacterStatsComponent } from './bulk-character-stats/bulk-character-stats.component';

@NgModule({
    declarations: [
        GradeComponent,
        FactionBarComponent,
        PlanetsideWrapperComponent,
        PlanetsideSearchComponent,
        PlanetsideCombatEventComponent,
        PlanetsideNewsComponent,
        NewsCardComponent,
        PlanetsideItemComponent,
        ItemCardComponent,
        PlanetsideItemStatsComponent,
        PlanetsideItemLeaderboardComponent,
        PlanetsideItemDamageCardComponent,
        PlanetsidePlayerComponent,
        CharacterCardComponent,
        PlanetsidePlayerStatsComponent,
        PlanetsidePlayerStatsSiegeCardComponent,
        StatsHistoryCardComponent,
        PlanetsidePlayerClassesComponent,
        PlanetsidePlayerVehiclesComponent,
        PlanetsidePlayerWeaponsComponent,
        PlanetsidePlayerWeaponsTableComponent,
        PlanetsidePlayerSessionsListComponent,
        PlanetsidePlayerSessionComponent,
        PlanetsideOutfitComponent,
        OutfitCardComponent,
        AlertCardComponent,
        PlanetsideAlertsListComponent,
        PlanetsideAlertComponent,
        PlanetsideAlertPlayersComponent,
        PlanetsideAlertOutfitsComponent,
        PlanetsideAlertWeaponsComponent,
        PlanetsideAlertVehiclesComponent,
        PlanetsideAlertMapComponent,
        ReplayMapComponent,
        EventCardComponent,
        PlanetsideEventsListComponent,
        PlanetsideEventComponent,
        PlanetsideWorldWrapperComponent,
        PlanetsideWorldComponent,
        WorldCardComponent,
        PlanetsideWorldPlayersComponent,
        PlanetsideWorldMapComponent,
        PlanetsideWorldZoneComponent,
        Ps2ZoneMapComponent,
        WeaponTrackerComponent,
        PopulationComponent,
        PlayerRanksComponent,
        BulkCharacterStatsComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialLib,
        CommonModule,
        VoidwellPipesModule,
        SharedComponentsModule,
        routing,
        NgPipesModule,
        LeafletModule,
        PlanetsidePipesModule
    ],
    providers: [
        RequestCache,
        PlanetsideApi,
        PerformanceGrades,
        DecimalPipe,
        DatePipe,
        D3Service,
        ZoneHelper,
        WorldService,
        ZoneService
    ],
    entryComponents: [PlanetsideWrapperComponent]
})
export class PlanetsideModule { }
