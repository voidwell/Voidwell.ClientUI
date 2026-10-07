import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavLink } from '@shared/ui/nav-link.model';
import { Zone } from '@core/api/models/ps2/reference.model';
import { ZoneRepository } from '@core/api/ps2/zone.repository';

@Injectable()
export class ZoneService {
    private zoneRepository = inject(ZoneRepository);

    /** `null` until the zones have loaded. */
    readonly zones = toSignal(
        this.zoneRepository.getZones().pipe(catchError(() => EMPTY)),
        { initialValue: null as Zone[] | null });

    /** Ids of every known zone. */
    readonly zoneIds = computed(() => (this.zones() ?? []).map(z => z.id));

    /** Tab links for the zones players can visit (test and instance zones are left out). */
    readonly zoneNavLinks = computed<NavLink[]>(() => (this.zones() ?? [])
        .filter(zone => zone.id === 344 || !(zone.id === 14 || zone.id === 10 || zone.id > 90))
        .map(zone => ({ path: String(zone.id), display: zone.name })));

    /** Name of a zone, or `undefined` while the zones load or when the id is unknown. */
    zoneName(zoneId: number | string): string | undefined {
        const id = String(zoneId);
        return this.zones()?.find(zone => String(zone.id) === id)?.name;
    }
}
