import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PS2_API_ROOT } from '@voidwell/planetside2/common';
import { World } from '../contracts/world.model';
import { Zone } from '../contracts/zone.model';

@Injectable()
export class MapRepository {    
    constructor(private http: HttpClient) {}

    getWorlds(platform: string): Observable<World[]> {
        return this.http.get<World[]>(`${PS2_API_ROOT}/world?platform=${platform}`);
    }

    getZones(platform: string): Observable<Zone[]> {
        return this.http.get<Zone[]>(`${PS2_API_ROOT}/zone?platform=${platform}`);
    }
}
