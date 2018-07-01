import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgReduxModule } from '@angular-redux/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material';
import { NgPipesModule } from 'ngx-pipes';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { MaterialLib } from './shared/materialLib.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { VoidwellApi } from './shared/services/voidwell-api.service';
import { SearchService } from './shared/services/search.service';
import { NavMenuService } from './shared/services/nav-menu.service';
import { VWHeaderComponent } from './vw-header/vw-header.component';
import { VWNavigationComponent } from './vw-navigation/vw-navigation.component';
import { VWFooterComponent } from './vw-footer/vw-footer.component';
import { VoidwellPipesModule } from './shared/pipes/voidwellpipes.modules';

import { routing, appRouterProviders } from './app.routes';
import { AppComponent } from './app.component';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        VWHeaderComponent,
        VWNavigationComponent,
        VWFooterComponent
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
        ReactiveFormsModule,
        NgReduxModule,
        NgPipesModule,
        LeafletModule.forRoot(),
        VoidwellPipesModule
    ],
    providers: [
        MatIconRegistry,
        appRouterProviders,
        VoidwellApi,
        SearchService,
        NavMenuService
    ]
})
export class AppModule { }
