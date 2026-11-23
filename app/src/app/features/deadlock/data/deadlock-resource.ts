import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { DeadlockQuery } from '@core/api/deadlock/deadlock-query';
import { DeadlockFilterService } from './deadlock-filter.service';

/**
 * A resource that loads again whenever the shared filters, or `key`, change. A `key` that returns `undefined`
 * holds the load back until it has a value. Call it in an injection context.
 */
export function deadlockResource<T, K = null>(load: (query: DeadlockQuery, key: K) => Observable<T>, key: () => K | undefined = () => null as K) {
    const filter = inject(DeadlockFilterService);

    return rxResource({
        params: () => {
            const current = key();
            return current === undefined ? undefined : { query: filter.query(), key: current };
        },
        stream: ({ params }) => load(params.query, params.key)
    });
}
