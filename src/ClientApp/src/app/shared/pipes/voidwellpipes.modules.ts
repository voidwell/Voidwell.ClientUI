import { NgModule } from '@angular/core';
import { GeneralPipesModule } from './general';
import { PlanetsidePipesModule } from './ps2';
import { NgPipesModule } from 'ngx-pipes';

@NgModule({
    declarations: [],
    imports: [],
    exports: [
        GeneralPipesModule,
        PlanetsidePipesModule,
        NgPipesModule
    ]
})

export class VoidwellPipesModule { }