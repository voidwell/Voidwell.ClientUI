import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { ApiClient, RequestOptions } from '../api-client';
import { Ps2Platform } from '../models/ps2/common.model';

export interface Ps2RequestOptions extends RequestOptions {
    /**
     * Which Daybreak instance serves the request. Defaults to the platform
     * currently selected in the UI; `false` omits the parameter for
     * platform-independent reference data.
     */
    platform?: Ps2Platform | false;
}

/** {@link ApiClient} that routes requests to a Daybreak instance through the `platform` query parameter. */
@Injectable({ providedIn: 'root' })
export class Ps2ApiClient {
    private api = inject(ApiClient);
    private planetside = inject<Store<unknown>>(Store).selectSignal(selectPlanetsideState);

    /** The platform selected in the UI, `pc` until the planetside state is loaded. */
    get selectedPlatform(): Ps2Platform {
        return (this.planetside()?.platform as Ps2Platform) ?? 'pc';
    }

    get<T>(url: string, options: Ps2RequestOptions = {}): Observable<T> {
        return this.api.get<T>(url, this.withPlatform(options));
    }

    post<TResponse = void, TBody = unknown>(url: string, body: TBody | null, options: Ps2RequestOptions = {}): Observable<TResponse> {
        return this.api.post<TResponse, TBody>(url, body, this.withPlatform(options));
    }

    put<TResponse = void, TBody = unknown>(url: string, body: TBody, options: Ps2RequestOptions = {}): Observable<TResponse> {
        return this.api.put<TResponse, TBody>(url, body, this.withPlatform(options));
    }

    delete<T = void>(url: string, options: Ps2RequestOptions = {}): Observable<T> {
        return this.api.delete<T>(url, this.withPlatform(options));
    }

    private withPlatform({ platform, ...options }: Ps2RequestOptions): RequestOptions {
        if (platform === false) {
            return options;
        }

        return { ...options, params: { ...options.params, platform: platform ?? this.selectedPlatform } };
    }
}
