import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { PS2_PLATFORMS, Ps2Platform } from '../models/ps2/common.model';

const INSTANCE_TIMEOUT_MS = 2000;

/**
 * Queries every Daybreak instance and merges the results, tagging each item with
 * the platform it came from. An instance that is slow or down contributes
 * nothing instead of failing the whole request.
 */
export function aggregateByPlatform<T>(request: (platform: Ps2Platform) => Observable<T[]>): Observable<(T & { platform: Ps2Platform })[]> {
    return forkJoin(
        PS2_PLATFORMS.map(platform =>
            request(platform).pipe(
                timeout(INSTANCE_TIMEOUT_MS),
                catchError(() => of([] as T[])),
                map(items => items.map(item => ({ ...item, platform })))
            )
        )
    ).pipe(map(results => results.flat()));
}
