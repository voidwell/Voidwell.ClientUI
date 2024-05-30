import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationModule } from '@voidwell/navigation';
import { HeaderComponent } from './header.component';
import { LogoComponent } from './logo/logo.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    MatIconModule,
    NavigationModule,
    RouterModule
  ],
  declarations: [
    HeaderComponent,
    LogoComponent
  ],
  exports: [HeaderComponent]
})
export class HeaderModule {}
