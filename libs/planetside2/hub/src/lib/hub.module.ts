import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonRouterModule, Route } from '@voidwell/common/router';
import { HubRepository } from './hub.repository';
import { EffectsModule } from '@ngrx/effects';
import { HubEffects } from './+state/effects';
import { StoreModule } from '@ngrx/store';
import { PS2_HUB_FEATURE_KEY } from './constants';
import { reducer } from './+state/reducer';
import { SpinnerModule } from '@voidwell/common/components';
import { HubComponent } from './hub.component';
import { HeaderBarComponent } from './components/header-bar/header-bar.component';
import { PlatformControlComponent } from './components/platform-control/platform-control.component';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { PlanetsidePipesModule } from '@voidwell/planetside2/common';
import { ReactiveFormsModule } from '@angular/forms';

export const routes: Route[] = [
  {
    outlet: 'header',
    path: '',
    component: HeaderBarComponent
  },
  {
    path: '',
    component: HubComponent,
    children: [
      { path: '', redirectTo: 'news', pathMatch: 'full' },
      { path: 'news', loadChildren: () => import('@voidwell/planetside2/news').then(m => m.NewsModule) }
    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    CommonRouterModule.forFeature({ lazy: routes }),
    EffectsModule.forFeature(HubEffects),
    StoreModule.forFeature(PS2_HUB_FEATURE_KEY, reducer),
    SpinnerModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    PlanetsidePipesModule
  ],
  declarations: [
    HubComponent,
    HeaderBarComponent,
    PlatformControlComponent,
    SearchInputComponent
  ],
  providers:[HubRepository]
})
export class HubModule {}
