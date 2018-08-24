import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';
import { PlanetsideItemStatsComponent } from './item/planetside-item-stats.component';
import { PlanetsideItemLeaderboardComponent } from './item/planetside-item-leaderboard.component';
import { PlanetsidePlayerStatsComponent } from './player/stats/planetside-player-stats.component';
import { PlanetsidePlayerClassesComponent } from './player/classes/planetside-player-classes.component';
import { PlanetsidePlayerVehiclesComponent } from './player/vehicles/planetside-player-vehicles.component';
import { PlanetsidePlayerWeaponsComponent } from './player/weapons/planetside-player-weapons.component';
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
import { PlanetsideWorldMapComponent } from './worlds/world/map/planetside-world-map.component';
import { PlanetsideWorldZoneComponent } from './worlds/world/map/zone/planetside-world-zone.component';
import { WeaponTrackerComponent } from './weapon-tracker/weapon-tracker.component';
import { PlayerRanksComponent } from './player-ranks/player-ranks.component';

const planetsideRoutes: Routes = [
    {
        path: '',
        component: PlanetsideWrapperComponent,
        children: [
            { path: '', redirectTo: 'news', pathMatch: 'full' },
            { path: 'news', component: PlanetsideNewsComponent },
            {
                path: 'item/:id',
                component: PlanetsideItemComponent,
                children: [
                    { path: '', redirectTo: 'stats', pathMatch: 'full' },
                    { path: 'stats', component: PlanetsideItemStatsComponent },
                    { path: 'leaderboard', component: PlanetsideItemLeaderboardComponent },
                ]
            },
            {
                path: 'player/:id',
                component: PlanetsidePlayerComponent,
                children: [
                    { path: '', redirectTo: 'stats', pathMatch: 'full' },
                    { path: 'stats', component: PlanetsidePlayerStatsComponent },
                    { path: 'classes', component: PlanetsidePlayerClassesComponent },
                    { path: 'classes/:id', component: PlanetsidePlayerClassesComponent },
                    { path: 'vehicles', component: PlanetsidePlayerVehiclesComponent },
                    { path: 'vehicles/:id', component: PlanetsidePlayerVehiclesComponent },
                    { path: 'weapons', component: PlanetsidePlayerWeaponsComponent },
                    { path: 'sessions', component: PlanetsidePlayerSessionsListComponent },
                    { path: 'sessions/:id', component: PlanetsidePlayerSessionComponent }
                ]
            },
            { path: 'outfit/:id', component: PlanetsideOutfitComponent },
            { path: 'alerts', component: PlanetsideAlertsListComponent },
            {
                path: 'alerts/:worldId/:instanceId',
                component: PlanetsideAlertComponent,
                children: [
                    { path: '', redirectTo: 'players', pathMatch: 'full' },
                    { path: 'players', component: PlanetsideAlertPlayersComponent },
                    { path: 'outfits', component: PlanetsideAlertOutfitsComponent },
                    { path: 'weapons', component: PlanetsideAlertWeaponsComponent },
                    { path: 'vehicles', component: PlanetsideAlertVehiclesComponent },
                    { path: 'map', component: PlanetsideAlertMapComponent }
                ]
            },
            { path: 'events', component: PlanetsideEventsListComponent },
            {
                path: 'events/:eventId',
                component: PlanetsideEventComponent,
                children: [
                    { path: '', redirectTo: 'players', pathMatch: 'full' },
                    { path: 'players', component: PlanetsideAlertPlayersComponent },
                    { path: 'outfits', component: PlanetsideAlertOutfitsComponent },
                    { path: 'weapons', component: PlanetsideAlertWeaponsComponent },
                    { path: 'vehicles', component: PlanetsideAlertVehiclesComponent },
                    { path: 'map', component: PlanetsideAlertMapComponent }
                ]
            },
            { path: 'worlds', component: PlanetsideWorldWrapperComponent },
            {
                path: 'worlds/:worldId',
                component: PlanetsideWorldComponent,
                children: [
                    { path: '', redirectTo: 'players', pathMatch: 'full' },
                    { path: 'players', component: PlanetsideWorldPlayersComponent },
                    {
                        path: 'map',
                        component: PlanetsideWorldMapComponent,
                        children: [
                            { path: ':zoneId', component: PlanetsideWorldZoneComponent }
                        ]
                    }
                ]
            },
            { path: 'oracle', component: WeaponTrackerComponent },
            { path: 'ranks', component: PlayerRanksComponent }
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(planetsideRoutes);