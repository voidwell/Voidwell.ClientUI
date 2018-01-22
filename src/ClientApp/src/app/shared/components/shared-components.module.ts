import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialLib } from './../materialLib.module';

import { ErrorMessageComponent } from './error-message/error-message.component';
import { LoaderComponent } from './loader/loader.component';
import { VWCountdownComponent } from './vw-countdown/vw-countdown.component';

@NgModule({
    declarations: [
        ErrorMessageComponent,
        LoaderComponent,
        VWCountdownComponent
    ],
    imports: [
        CommonModule,
        MaterialLib
    ],
    exports: [
        ErrorMessageComponent,
        LoaderComponent,
        VWCountdownComponent
    ]
})
export class SharedComponentsModule { }