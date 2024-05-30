import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpClientsInterceptor } from './http-clients-headers.interceptor';

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpClientsInterceptor,
      multi: true
    }
  ]
})
export class HttpClientsModule {}
