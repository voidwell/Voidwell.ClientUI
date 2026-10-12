import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import * as d3 from 'd3';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { ProfileRepository } from '@core/api/ps2/profile.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';

/** Slice colours, assigned in order of playtime. */
const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#fbbf24', '#f97316', '#ef4444', '#ec4899', '#84cc16'];

export interface ClassUsageSlice {
    profileTypeId: number;
    name: string;
    color: string;
    percent: number;
    hours: number;
    path: string;
}

@Component({
    selector: 'planetside-player-stats-class-usage-card',
    templateUrl: './planetside-player-stats-class-usage-card.component.html',
    styleUrls: ['./planetside-player-stats-class-usage-card.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, RouterLink, DecimalPipe]
})

export class PlanetsidePlayerStatsClassUsageCardComponent {
    private profileRepository = inject(ProfileRepository);

    readonly player = input.required<CharacterDetails>();

    /** The classes of every faction, `undefined` until loaded. */
    readonly profiles = toSignal(this.profileRepository.getProfiles());

    /** The player's faction's classes with their playtime, most played first. */
    private readonly classTimes = computed(() => {
        const player = this.player();
        const profiles = this.profiles() ?? [];

        return profiles
            .filter(profile => profile.factionId === player.factionId)
            .map(profile => ({
                profile,
                playTime: (player.profileStats ?? []).find(stat => stat.profileId === profile.profileTypeId)?.playTime ?? 0
            }))
            .filter(entry => entry.playTime > 0)
            .sort((a, b) => b.playTime - a.playTime);
    });

    readonly totalHours = computed(() => this.classTimes().reduce((sum, entry) => sum + entry.playTime, 0) / 3600);

    readonly slices = computed<ClassUsageSlice[]>(() => {
        const entries = this.classTimes();
        const total = entries.reduce((sum, entry) => sum + entry.playTime, 0);
        const arc = d3.arc<d3.PieArcDatum<number>>().innerRadius(55).outerRadius(78).padAngle(0.02).cornerRadius(2);
        const arcs = d3.pie<number>().sort(null)(entries.map(entry => entry.playTime));

        return entries.map((entry, i) => ({
            profileTypeId: entry.profile.profileTypeId,
            name: entry.profile.name ?? '',
            color: COLORS[i % COLORS.length],
            percent: entry.playTime / total * 100,
            hours: entry.playTime / 3600,
            path: arc(arcs[i]) ?? ''
        }));
    });
}
