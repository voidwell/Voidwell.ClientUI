"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var ngx_pipes_1 = require("ngx-pipes");
var d3_ng2_service_1 = require("d3-ng2-service");
var materialLib_module_1 = require("../shared/materialLib.module");
var voidwellpipes_modules_1 = require("../shared/pipes/voidwellpipes.modules");
var shared_components_module_1 = require("../shared/components/shared-components.module");
var planetside_routes_1 = require("./planetside.routes");
var planetside_api_service_1 = require("./planetside-api.service");
var planetsidewrapper_component_1 = require("./planetsidewrapper.component");
var planetside_combat_event_component_1 = require("./combat-event/planetside-combat-event.component");
var planetside_news_component_1 = require("./news/planetside-news.component");
var planetside_item_component_1 = require("./item/planetside-item.component");
var planetside_item_damage_card_component_1 = require("./item/damage-card/planetside-item-damage-card.component");
var planetside_player_component_1 = require("./player/planetside-player.component");
var planetside_player_stats_component_1 = require("./player/stats/planetside-player-stats.component");
var planetside_player_stats_siege_card_component_1 = require("./player/stats/siege-card/planetside-player-stats-siege-card.component");
var planetside_player_classes_component_1 = require("./player/classes/planetside-player-classes.component");
var planetside_player_vehicles_component_1 = require("./player/vehicles/planetside-player-vehicles.component");
var planetside_player_weapons_component_1 = require("./player/weapons/planetside-player-weapons.component");
var planetside_player_weapons_table_component_1 = require("./player/weapons-table/planetside-player-weapons-table.component");
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
var PlanetsideModule = (function () {
    function PlanetsideModule() {
    }
    return PlanetsideModule;
}());
PlanetsideModule = __decorate([
    core_1.NgModule({
        declarations: [
            planetsidewrapper_component_1.PlanetsideWrapperComponent,
            planetside_combat_event_component_1.PlanetsideCombatEventComponent,
            planetside_news_component_1.PlanetsideNewsComponent,
            planetside_item_component_1.PlanetsideItemComponent,
            planetside_item_damage_card_component_1.PlanetsideItemDamageCardComponent,
            planetside_player_component_1.PlanetsidePlayerComponent,
            planetside_player_stats_component_1.PlanetsidePlayerStatsComponent,
            planetside_player_stats_siege_card_component_1.PlanetsidePlayerStatsSiegeCardComponent,
            planetside_player_classes_component_1.PlanetsidePlayerClassesComponent,
            planetside_player_vehicles_component_1.PlanetsidePlayerVehiclesComponent,
            planetside_player_weapons_component_1.PlanetsidePlayerWeaponsComponent,
            planetside_player_weapons_table_component_1.PlanetsidePlayerWeaponsTableComponent,
            planetside_player_sessions_list_component_1.PlanetsidePlayerSessionsListComponent,
            planetside_player_session_component_1.PlanetsidePlayerSessionComponent,
            planetside_outfit_component_1.PlanetsideOutfitComponent,
            planetside_alerts_list_component_1.PlanetsideAlertsListComponent,
            planetside_alert_component_1.PlanetsideAlertComponent,
            planetside_alert_players_component_1.PlanetsideAlertPlayersComponent,
            planetside_alert_outfits_component_1.PlanetsideAlertOutfitsComponent,
            planetside_alert_weapons_component_1.PlanetsideAlertWeaponsComponent,
            planetside_alert_vehicles_component_1.PlanetsideAlertVehiclesComponent,
            planetside_alert_map_component_1.PlanetsideAlertMapComponent,
            planetside_events_list_component_1.PlanetsideEventsListComponent,
            planetside_event_component_1.PlanetsideEventComponent
        ],
        imports: [
            forms_1.FormsModule,
            forms_1.ReactiveFormsModule,
            materialLib_module_1.MaterialLib,
            common_1.CommonModule,
            voidwellpipes_modules_1.VoidwellPipesModule,
            shared_components_module_1.SharedComponentsModule,
            planetside_routes_1.routing,
            ngx_pipes_1.NgPipesModule
        ],
        providers: [
            planetside_api_service_1.PlanetsideApi,
            common_1.DecimalPipe,
            common_1.DatePipe,
            d3_ng2_service_1.D3Service
        ],
        entryComponents: [planetsidewrapper_component_1.PlanetsideWrapperComponent]
    })
], PlanetsideModule);
exports.PlanetsideModule = PlanetsideModule;
