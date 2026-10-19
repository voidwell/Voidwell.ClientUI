import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { ProfileRepository } from '@core/api/ps2/profile.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PlanetsidePlayerStatsUsageDonutComponent, UsageEntry } from '../usage-donut/planetside-player-stats-usage-donut.component';

@Component({
    selector: 'planetside-player-stats-class-usage-card',
    templateUrl: './planetside-player-stats-class-usage-card.component.html',
    styleUrls: ['./planetside-player-stats-class-usage-card.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, RouterLink, PlanetsidePlayerStatsUsageDonutComponent]
})

export class PlanetsidePlayerStatsClassUsageCardComponent {
    private profileRepository = inject(ProfileRepository);

    readonly player = input.required<CharacterDetails>();

    /** The classes of every faction, `undefined` until loaded. */
    readonly profiles = toSignal(this.profileRepository.getProfiles());

    /** The player's faction's classes with their playtime, most played first. */
    readonly classTimes = computed<UsageEntry[]>(() => {
        const player = this.player();
        const profiles = this.profiles() ?? [];

        return profiles
            .filter(profile => profile.factionId === player.factionId)
            .map(profile => ({
                id: profile.profileTypeId,
                name: profile.name ?? '',
                playTime: (player.profileStats ?? []).find(stat => stat.profileId === profile.profileTypeId)?.playTime ?? 0
            }))
            .filter(entry => entry.playTime > 0)
            .sort((a, b) => b.playTime - a.playTime);
    });
}
