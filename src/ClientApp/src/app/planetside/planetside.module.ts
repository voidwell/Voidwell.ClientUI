import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { D3Service } from 'd3-ng2-service';
import { MaterialLib } from '../shared/materialLib.module';
import { VoidwellPipesModule } from '../shared/pipes/voidwellpipes.modules';
import { routing } from './planetside.routes';
import { PlanetsideApi } from './planetside-api.service';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';
import { PlanetsideItemDamageCardComponent } from './item/damage-card/planetside-item-damage-card.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialLib,
        CommonModule,
        VoidwellPipesModule,
        routing
    ],
    declarations: [
        PlanetsideWrapperComponent,
        PlanetsideNewsComponent,
        PlanetsideItemComponent,
        PlanetsideItemDamageCardComponent,
        PlanetsidePlayerComponent
    ],
    providers: [
        PlanetsideApi,
        D3Service
    ],
    entryComponents: [PlanetsideWrapperComponent]
})
export class PlanetsideModule { }
