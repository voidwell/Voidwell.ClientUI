import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialLib } from './../materialLib.module';

import { ErrorMessageComponent } from './error-message/error-message.component';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
    declarations: [
        ErrorMessageComponent,
        LoaderComponent
    ],
    imports: [
        CommonModule,
        MaterialLib
    ],
    exports: [
        ErrorMessageComponent,
        LoaderComponent
    ]
})
export class SharedComponentsModule { }