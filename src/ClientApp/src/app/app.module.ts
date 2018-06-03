import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgReduxModule } from '@angular-redux/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material';
import { NgPipesModule } from 'ngx-pipes';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { MaterialLib } from './shared/materialLib.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { VoidwellApi } from './shared/services/voidwell-api.service';
import { HeaderService } from './shared/services/header.service';
import { VWHeaderComponent } from './vw-header/vw-header.component';
import { VWNavbarComponent } from './vw-header/vw-navbar/vw-navbar.component';

import { routing, appRouterProviders } from './app.routes';
import { AppComponent } from './app.component';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        VWHeaderComponent,
        VWNavbarComponent
    ],
    imports: [
        SharedComponentsModule,
        BrowserModule,
        MaterialLib,
        BrowserAnimationsModule,
        routing,
        CommonModule,
        HttpModule,
        FormsModule,
        NgReduxModule,
        NgPipesModule,
        LeafletModule.forRoot()
    ],
    providers: [
        MatIconRegistry,
        appRouterProviders,
        VoidwellApi,
        HeaderService
    ]
})
export class AppModule { }
