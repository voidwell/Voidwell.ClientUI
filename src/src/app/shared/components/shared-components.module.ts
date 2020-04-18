import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialLib } from './../materialLib.module';

import { ErrorMessageComponent } from './error-message/error-message.component';
import { LoaderComponent } from './loader/loader.component';
import { VWCountdownComponent } from './vw-countdown/vw-countdown.component';
import { VWTabNavBarComponent } from './vw-tab-nav-bar/vw-tab-nav-bar.component';
import { VWTabNavSubBarComponent } from './vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { EntryListComponent } from './entry-list/entry-list.component';

@NgModule({
    declarations: [
        ErrorMessageComponent,
        LoaderComponent,
        VWCountdownComponent,
        VWTabNavBarComponent,
        VWTabNavSubBarComponent,
        EntryListComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        MaterialLib
    ],
    exports: [
        ErrorMessageComponent,
        LoaderComponent,
        VWCountdownComponent,
        VWTabNavBarComponent,
        VWTabNavSubBarComponent,
        EntryListComponent
    ]
})
export class SharedComponentsModule { }