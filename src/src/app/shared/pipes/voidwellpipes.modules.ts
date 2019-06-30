import { NgModule } from '@angular/core';
import { GeneralPipesModule } from './general';
import { NgPipesModule } from 'ngx-pipes';

@NgModule({
    declarations: [],
    imports: [],
    exports: [
        GeneralPipesModule,
        NgPipesModule
    ]
})

export class VoidwellPipesModule { }