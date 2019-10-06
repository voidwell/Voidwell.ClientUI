import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../../../shared/services/voidwell-auth.service';
import { RequestCache } from './../../../shared/services/request-cache.service';
import { ApiBase } from './../../../shared/services/api-base';

@Injectable()
export class PlanetsideArenaApi extends ApiBase {
    public ps2Url = location.origin + '/api/psa/';

    constructor(public authService: VoidwellAuthService, public http: HttpClient, public cache: RequestCache) {
        super(authService, http, cache);
    }
}