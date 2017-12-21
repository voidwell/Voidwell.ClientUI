import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { D3Service } from 'd3-ng2-service';
import { MaterialLib } from '../shared/materialLib.module';
import { VoidwellPipesModule } from '../shared/pipes/voidwellpipes.modules';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { routing } from './planetside.routes';
import { PlanetsideApi } from './planetside-api.service';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';
import { PlanetsideItemDamageCardComponent } from './item/damage-card/planetside-item-damage-card.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';
import { PlanetsidePlayerStatsComponent } from './player/stats/planetside-player-stats.component';
import { PlanetsidePlayerStatsSiegeCardComponent } from './player/stats/siege-card/planetside-player-stats-siege-card.component';
import { PlanetsidePlayerClassesComponent } from './player/classes/planetside-player-classes.component';
import { PlanetsidePlayerVehiclesComponent } from './player/vehicles/planetside-player-vehicles.component';
import { PlanetsidePlayerWeaponsComponent } from './player/weapons/planetside-player-weapons.component';
import { PlanetsidePlayerWeaponsTableComponent } from './player/weapons-table/planetside-player-weapons-table.component';

@NgModule({
    declarations: [
        PlanetsideWrapperComponent,
        PlanetsideNewsComponent,
        PlanetsideItemComponent,
        PlanetsideItemDamageCardComponent,
        PlanetsidePlayerComponent,
        PlanetsidePlayerStatsComponent,
        PlanetsidePlayerStatsSiegeCardComponent,
        PlanetsidePlayerClassesComponent,
        PlanetsidePlayerVehiclesComponent,
        PlanetsidePlayerWeaponsComponent,
        PlanetsidePlayerWeaponsTableComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialLib,
        CommonModule,
        VoidwellPipesModule,
        SharedComponentsModule,
        routing,
    ],
    providers: [
        PlanetsideApi,
        DecimalPipe,
        D3Service
    ],
    entryComponents: [PlanetsideWrapperComponent]
})
export class PlanetsideModule { }
