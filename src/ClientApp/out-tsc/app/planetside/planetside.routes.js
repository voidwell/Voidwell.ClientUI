"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var planetsidewrapper_component_1 = require("./planetsidewrapper.component");
var planetside_news_component_1 = require("./news/planetside-news.component");
var planetside_player_component_1 = require("./player/planetside-player.component");
var planetside_item_component_1 = require("./item/planetside-item.component");
var planetside_player_stats_component_1 = require("./player/stats/planetside-player-stats.component");
var planetside_player_classes_component_1 = require("./player/classes/planetside-player-classes.component");
var planetside_player_vehicles_component_1 = require("./player/vehicles/planetside-player-vehicles.component");
var planetside_player_weapons_component_1 = require("./player/weapons/planetside-player-weapons.component");
var planetside_player_sessions_list_component_1 = require("./player/sessions/sessions-list/planetside-player-sessions-list.component");
var planetside_player_session_component_1 = require("./player/sessions/session/planetside-player-session.component");
var planetside_outfit_component_1 = require("./outfit/planetside-outfit.component");
var planetside_alerts_list_component_1 = require("./alerts/alerts-list/planetside-alerts-list.component");
var planetside_alert_component_1 = require("./alerts/alert/planetside-alert.component");
var planetside_alert_players_component_1 = require("./alerts/alert/players/planetside-alert-players.component");
var planetside_alert_outfits_component_1 = require("./alerts/alert/outfits/planetside-alert-outfits.component");
var planetside_alert_weapons_component_1 = require("./alerts/alert/weapons/planetside-alert-weapons.component");
var planetside_alert_vehicles_component_1 = require("./alerts/alert/vehicles/planetside-alert-vehicles.component");
var planetside_alert_map_component_1 = require("./alerts/alert/map/planetside-alert-map.component");
var planetside_events_list_component_1 = require("./events/events-list/planetside-events-list.component");
var planetside_event_component_1 = require("./events/event/planetside-event.component");
var planetsideRoutes = [
    {
        path: '',
        component: planetsidewrapper_component_1.PlanetsideWrapperComponent,
        children: [
            { path: '', redirectTo: 'news', pathMatch: 'full' },
            { path: 'news', component: planetside_news_component_1.PlanetsideNewsComponent },
            { path: 'item/:id', component: planetside_item_component_1.PlanetsideItemComponent },
            {
                path: 'player/:id',
                component: planetside_player_component_1.PlanetsidePlayerComponent,
                children: [
                    { path: '', redirectTo: 'stats', pathMatch: 'full' },
                    { path: 'stats', component: planetside_player_stats_component_1.PlanetsidePlayerStatsComponent },
                    { path: 'classes', component: planetside_player_classes_component_1.PlanetsidePlayerClassesComponent },
                    { path: 'classes/:id', component: planetside_player_classes_component_1.PlanetsidePlayerClassesComponent },
                    { path: 'vehicles', component: planetside_player_vehicles_component_1.PlanetsidePlayerVehiclesComponent },
                    { path: 'vehicles/:id', component: planetside_player_vehicles_component_1.PlanetsidePlayerVehiclesComponent },
                    { path: 'weapons', component: planetside_player_weapons_component_1.PlanetsidePlayerWeaponsComponent },
                    { path: 'sessions', component: planetside_player_sessions_list_component_1.PlanetsidePlayerSessionsListComponent },
                    { path: 'sessions/:id', component: planetside_player_session_component_1.PlanetsidePlayerSessionComponent }
                ]
            },
            { path: 'outfit/:id', component: planetside_outfit_component_1.PlanetsideOutfitComponent },
            { path: 'alerts', component: planetside_alerts_list_component_1.PlanetsideAlertsListComponent },
            {
                path: 'alerts/:worldId/:instanceId',
                component: planetside_alert_component_1.PlanetsideAlertComponent,
                children: [
                    { path: '', redirectTo: 'players', pathMatch: 'full' },
                    { path: 'players', component: planetside_alert_players_component_1.PlanetsideAlertPlayersComponent },
                    { path: 'outfits', component: planetside_alert_outfits_component_1.PlanetsideAlertOutfitsComponent },
                    { path: 'weapons', component: planetside_alert_weapons_component_1.PlanetsideAlertWeaponsComponent },
                    { path: 'vehicles', component: planetside_alert_vehicles_component_1.PlanetsideAlertVehiclesComponent },
                    { path: 'map', component: planetside_alert_map_component_1.PlanetsideAlertMapComponent }
                ]
            },
            { path: 'events', component: planetside_events_list_component_1.PlanetsideEventsListComponent },
            {
                path: 'events/:eventId',
                component: planetside_event_component_1.PlanetsideEventComponent,
                children: [
                    { path: '', redirectTo: 'players', pathMatch: 'full' },
                    { path: 'players', component: planetside_alert_players_component_1.PlanetsideAlertPlayersComponent },
                    { path: 'outfits', component: planetside_alert_outfits_component_1.PlanetsideAlertOutfitsComponent },
                    { path: 'weapons', component: planetside_alert_weapons_component_1.PlanetsideAlertWeaponsComponent },
                    { path: 'vehicles', component: planetside_alert_vehicles_component_1.PlanetsideAlertVehiclesComponent },
                    { path: 'map', component: planetside_alert_map_component_1.PlanetsideAlertMapComponent }
                ]
            }
        ]
    }
];
exports.routing = router_1.RouterModule.forChild(planetsideRoutes);
