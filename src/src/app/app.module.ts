import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { NgPipesModule } from 'ngx-pipes';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialLib } from './shared/materialLib.module';
import { RequestCache } from './shared/services/request-cache.service';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { VoidwellApi } from './shared/services/voidwell-api.service';
import { SearchService } from './shared/services/search.service';
import { NavMenuService } from './shared/services/nav-menu.service';
import { VWHeaderComponent } from './vw-header/vw-header.component';
import { VWLogoComponent } from './vw-header/vw-logo/vw-logo.component';
import { VWNavigationComponent } from './vw-navigation/vw-navigation.component';
import { VWFooterComponent } from './vw-footer/vw-footer.component';
import { VoidwellPipesModule } from './shared/pipes/voidwellpipes.modules';

import { routing, appRouterProviders } from './app.routes';
import { AppComponent } from './app.component';
import { reducers } from './store/app.states';
import { AuthEffects, RegistrationEffects } from './store/effects';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        VWHeaderComponent,
        VWLogoComponent,
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
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(reducers, {}),
        EffectsModule.forRoot([AuthEffects, RegistrationEffects]),
        NgPipesModule,
        LeafletModule,
        FlexLayoutModule,
        VoidwellPipesModule
    ],
    providers: [
        RequestCache,
        MatIconRegistry,
        appRouterProviders,
        VoidwellApi,
        SearchService,
        NavMenuService
    ]
})
export class AppModule { }
