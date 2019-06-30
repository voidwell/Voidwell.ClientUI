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
import { routing } from './planetside-arena.routes';
import { PlanetsideArenaApi } from './shared/services/planetside-arena-api.service';
import { PSAWrapperComponent } from './psawrapper.component';

@NgModule({
    declarations: [
        PSAWrapperComponent
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
        LeafletModule
    ],
    providers: [
        PlanetsideArenaApi,
        RequestCache,
        DecimalPipe,
        DatePipe,
        D3Service
    ],
    entryComponents: [PSAWrapperComponent]
})
export class PlanetsideArenaModule { }
