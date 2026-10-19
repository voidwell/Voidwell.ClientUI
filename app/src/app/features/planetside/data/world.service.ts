import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { World } from '@core/api/models/ps2/world.model';
import { WorldRepository } from '@core/api/ps2/world.repository';

/** The worlds (servers) of the selected platform; reloaded when the platform changes. */
@Injectable()
export class WorldService {
    private worldRepository = inject(WorldRepository);
    private platform = inject(Store).selectSignal(selectPlanetsideState);
    private platform$ = toObservable(computed(() => this.platform()?.platform));

    /** All worlds, including legacy ones; `null` until the first load completes. */
    readonly worlds = toSignal(
        this.platform$.pipe(
            switchMap(() => this.worldRepository.getWorlds().pipe(catchError(() => EMPTY)))),
        { initialValue: null as World[] | null });

    /** Only the currently live worlds; `null` until the first load completes. */
    readonly activeWorlds = toSignal(
        this.platform$.pipe(
            switchMap(() => this.worldRepository.getActiveWorlds().pipe(catchError(() => EMPTY)))),
        { initialValue: null as World[] | null });
}
