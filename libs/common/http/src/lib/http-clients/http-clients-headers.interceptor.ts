import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { AppSettingsService } from '@capital-access/common/settings';
import { Observable } from 'rxjs';
import { HttpClientConfig, HttpClients } from './http-client-config.model';

const allHttpClients : HttpClients = {
  voidwell: {
    url: 'https://voidwell.com/',
  }
};

@Injectable()
export class HttpClientsInterceptor implements HttpInterceptor {
  private httpClients: HttpClientConfig[];

  

  constructor(/*settings: AppSettingsService*/) {
    //const allHttpClients = settings.getSettings<{ httpClients: HttpClients }>().httpClients;
    this.httpClients = Object.values(allHttpClients).filter(config => config.headers);
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headersToAdd = this.httpClients.find(config => req.url.startsWith(config.url))?.headers;

    if (headersToAdd) {
      req = req.clone({
        setHeaders: headersToAdd
      });
    }

    return next.handle(req);
  }
}
