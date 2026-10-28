import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorldOnlineState } from '@core/api/models/ps2/world-state.model';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { AlertIndicatorComponent } from '../components/alert-indicator/alert-indicator.component';
import { ZoneService } from '../data/zone.service';
import { FactionCodePipe } from '../pipes/faction-code.pipe';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { WorldsPopulationCardComponent } from './worlds-population-card/worlds-population-card.component';
import { FACTION_KEYS, FactionKey, ZoneCell, factionTotal, zoneCell, zoneColumnIds } from './world-list-figures';

/** A server's row of the list. */
export interface WorldRow {
    id: number;
    name: string;
    isOnline: boolean;
    online: number | null;
    factions: Record<FactionKey, number | null>;
    /** Cells by zone id; a zone the server does not report shows nothing. */
    cells: Record<number, ZoneCell>;
}

type Result = { worlds: WorldOnlineState[] } | { error: string };

@Component({
    templateUrl: './planetside-world-wrapper.component.html',
    styleUrls: ['./planetside-world-wrapper.component.css'],
    imports: [
        MatCard, MatCardTitle, MatCardContent, MatIcon, RouterLink, NgClass, NgTemplateOutlet, DecimalPipe, DatePipe,
        LoaderComponent, ErrorCardComponent, AlertIndicatorComponent, FactionCodePipe, FactionColorPipe, WorldsPopulationCardComponent
    ]
})
export class PlanetsideWorldWrapperComponent {
    private worldStateRepository = inject(WorldStateRepository);
    private zoneService = inject(ZoneService);

    readonly factionKeys = FACTION_KEYS;
    /** The faction id behind each faction column, for its code and colour. */
    readonly factionIds: Record<FactionKey, number> = { vs: 1, nc: 2, tr: 3, ns: 4 };

    private readonly result = signal<Result | null>(null);
    /** Servers whose zones are showing on a phone, where the zone columns are hidden. */
    readonly expanded = signal<ReadonlySet<number>>(new Set());

    readonly isLoading = computed(() => this.result() === null);
    readonly errorMessage = computed(() => {
        const result = this.result();
        return result && 'error' in result ? result.error : null;
    });
    private readonly worlds = computed(() => {
        const result = this.result();
        return result && 'worlds' in result ? result.worlds : [];
    });

    /** One column per zone any server reports, in zone order, so new zones appear without a change here. */
    readonly zones = computed(() => {
        const zoneStates = this.worlds().flatMap(world => world.zoneStates ?? []);
        return zoneColumnIds(this.worlds()).map(id => ({
            id,
            name: zoneStates.find(zone => zone.id === id && zone.name)?.name ?? this.zoneService.zoneName(id) ?? `Zone ${id}`
        }));
    });

    /** The servers, by name. */
    readonly rows = computed<WorldRow[]>(() => {
        const zoneIds = this.zones().map(zone => zone.id);
        return [...this.worlds()]
            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
            .map(world => ({
                id: world.id,
                name: world.name ?? `World ${world.id}`,
                isOnline: world.isOnline,
                online: world.isOnline ? world.onlineCharacters : null,
                factions: Object.fromEntries(FACTION_KEYS.map(key => [key, factionTotal(world, key)])) as Record<FactionKey, number | null>,
                cells: Object.fromEntries(zoneIds.map(id => [id, zoneCell(world.zoneStates?.find(zone => zone.id === id))]))
            }));
    });

    /** The servers that are up, for the population chart. */
    readonly onlineWorlds = computed(() => this.rows().filter(row => row.isOnline).map(row => ({ id: row.id, name: row.name })));

    readonly totalOnline = computed(() => this.worlds().reduce((total, world) => total + (world.isOnline ? world.onlineCharacters : 0), 0));
    readonly onlineWorldCount = computed(() => this.worlds().filter(world => world.isOnline).length);

    constructor() {
        this.worldStateRepository.getWorldStates()
            .pipe(catchError(error => of({ error: getErrorMessage(error) })))
            .subscribe(worlds => this.result.set(Array.isArray(worlds) ? { worlds } : worlds));
    }

    toggle(worldId: number): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(worldId)) {
                next.add(worldId);
            }
            return next;
        });
    }
}
