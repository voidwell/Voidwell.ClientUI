import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpClientsModule } from './http-clients/http-clients.module';

@NgModule({
  imports: [CommonModule, HttpClientModule, HttpClientsModule]
})
export class CommonHttpModule {}
