import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CommonNavigationModule } from '@voidwell/common/navigation';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { NavMenuService } from './nav-menu.service';
import { NavigationComponent } from './navigation.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    CommonNavigationModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatTreeModule,
    MatButtonModule
  ],
  declarations: [
    NavigationComponent,
    SideNavComponent
  ],
  providers: [
    NavMenuService,
    MatIconRegistry
  ],
  exports: [NavigationComponent]
})
export class NavigationModule {}
