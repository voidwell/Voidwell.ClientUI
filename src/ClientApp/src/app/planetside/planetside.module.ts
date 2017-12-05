import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialLib } from '../shared/materialLib.module';
import { routing } from './planetside.routes';
import { PlanetsideApi } from './planetside-api.service';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';

@NgModule({
    imports: [
        MaterialLib,
        CommonModule,
        routing
    ],
    declarations: [
        PlanetsideWrapperComponent,
        PlanetsideNewsComponent
    ],
    providers: [
        PlanetsideApi
    ],
    entryComponents: [PlanetsideWrapperComponent]
})
export class PlanetsideModule { }
