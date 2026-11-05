import { Component, computed, forwardRef, inject, effect, input, untracked } from '@angular/core';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';
import { Breadcrumb } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { CombatEventHeaderView } from '../../components/combat-event/combat-event-header.component';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { CombatEventPageComponent } from '../../components/combat-event-page/combat-event-page.component';
import { WorldService } from '../../data/world.service';
import { ZoneService } from '../../data/zone.service';

@Component({
    template: `<combat-event-page [header]="header()" [crumbs]="breadcrumbs()" [loading]="loading()" [errorMessage]="errorMessage()" [overview]="section() === null"></combat-event-page>`,
    providers: [{ provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideEventComponent) }],
    imports: [CombatEventPageComponent]
})

export class PlanetsideEventComponent extends PlanetsideCombatEventComponent<CustomEventDetails> {
    private customEventRepository = inject(CustomEventRepository);
    private worldService = inject(WorldService);
    private zoneService = inject(ZoneService);
    readonly eventId = input<string>();

    readonly header = computed<CombatEventHeaderView | null>(() => {
        const event = this.event();
        if (!event) {
            return null;
        }

        const world = this.worldService.worlds()?.find(candidate => String(candidate.id) === String(event.serverId))?.name ?? '';
        const zone = this.zoneService.zoneName(event.mapId) ?? '';
        // Territory held by each faction at the end of the event; not every event recorded it
        const score = event.score;
        return {
            title: event.name,
            subtitle: `${world} › ${zone}`,
            description: event.description ?? '',
            start: new Date(event.startDate ?? 0),
            end: new Date(event.endDate ?? 0),
            scores: score ? { vs: score[1] ?? 0, nc: score[2] ?? 0, tr: score[3] ?? 0 } : null,
            zoneId: event.mapId ?? null
        };
    });

    /** Events, then this event, then the page under it, if one is showing. */
    readonly breadcrumbs = computed<Breadcrumb[]>(() => {
        const section = this.section();
        return [
            { label: 'Events', link: '/ps2/events' },
            { label: this.event()?.name ?? 'Event', link: section ? `/ps2/events/${this.eventId()}` : undefined },
            ...(section ? [{ label: section }] : [])
        ];
    });

    constructor() {
        super();
        effect(() => {
            const eventId = this.eventId();

            untracked(() => this.load(this.customEventRepository.getEvent(eventId)));
        });
    }
}
