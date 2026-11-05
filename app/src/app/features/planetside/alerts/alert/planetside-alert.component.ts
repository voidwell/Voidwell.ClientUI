import { Component, computed, forwardRef, inject, effect, input, untracked } from '@angular/core';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { Breadcrumb } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { DEFAULT_ALERT_MINUTES } from '../../components/alert-view';
import { CombatEventHeaderView, FactionScores } from '../../components/combat-event/combat-event-header.component';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { CombatEventPageComponent } from '../../components/combat-event-page/combat-event-page.component';
import { ZoneService } from '../../data/zone.service';
import { WorldService } from '../../data/world.service';

@Component({
    template: `<combat-event-page [header]="header()" [crumbs]="breadcrumbs()" [loading]="loading()" [errorMessage]="errorMessage()" [overview]="section() === null"></combat-event-page>`,
    providers: [{ provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideAlertComponent) }],
    imports: [CombatEventPageComponent]
})

export class PlanetsideAlertComponent extends PlanetsideCombatEventComponent<AlertResult> {
    private alertRepository = inject(AlertRepository);
    private worldService = inject(WorldService);
    private zoneService = inject(ZoneService);
    readonly worldId = input<string>();
    readonly instanceId = input<string>();

    private readonly start = computed(() => new Date(this.event()?.startDate ?? 0));

    /** When the alert ended, or is due to end. */
    private readonly end = computed(() => {
        const alert = this.event();
        return alert?.endDate ? new Date(alert.endDate) : new Date(this.start().getTime() + DEFAULT_ALERT_MINUTES * 60000);
    });

    readonly header = computed<CombatEventHeaderView | null>(() => {
        const alert = this.event();
        if (!alert) {
            return null;
        }

        const world = this.worldService.worlds()?.find(candidate => candidate.id === alert.worldId)?.name ?? '';
        const zone = this.zoneService.zoneName(alert.zoneId) ?? '';
        return {
            title: alert.metagameEvent?.name ?? 'Alert',
            subtitle: `${world} › ${zone}`,
            description: alert.metagameEvent?.description ?? '',
            start: this.start(),
            end: this.end(),
            scores: { vs: alert.lastFactionVS, nc: alert.lastFactionNC, tr: alert.lastFactionTR },
            startScores: { vs: alert.startFactionVS, nc: alert.startFactionNC, tr: alert.startFactionTR } satisfies FactionScores,
            zoneId: alert.zoneId ?? null,
            alarm: true
        };
    });

    /** Alerts, then this alert, then the page under it, if one is showing. */
    readonly breadcrumbs = computed<Breadcrumb[]>(() => {
        const section = this.section();
        return [
            { label: 'Alerts', link: '/ps2/alerts' },
            { label: this.event()?.metagameEvent?.name ?? 'Alert', link: section ? `/ps2/alerts/${this.worldId()}/${this.instanceId()}` : undefined },
            ...(section ? [{ label: section }] : [])
        ];
    });

    constructor() {
        super();
        effect(() => {
            const worldId = this.worldId();
            const instanceId = this.instanceId();

            untracked(() => this.load(this.alertRepository.getAlert(worldId, instanceId)));
        });
    }
}
