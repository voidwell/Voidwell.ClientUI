import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ProfileRepository } from '@core/api/ps2/profile.repository';
import { CharacterDetailsProfileStat } from '@core/api/models/ps2/character.model';
import { Profile } from '@core/api/models/ps2/reference.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { PlanetsidePlayerWeaponsTableComponent } from '../weapons-table/planetside-player-weapons-table.component';
import { PlanetsideStatTileComponent } from '../stat-tile/planetside-stat-tile.component';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { hours, perMinute, ratio } from '../stat-math';
import { classWeapons } from './class-weapons';

export interface ClassRow {
    profile: Profile;
    stats: Partial<CharacterDetailsProfileStat>;
}

/** The player's classes, and one class in detail when the route names it. */
@Component({
    templateUrl: './planetside-player-classes.component.html',
    styleUrls: ['../player-detail.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, MatIcon, RouterLink, DecimalPipe, PercentPipe, DgcImageUrlPipe, PlanetsidePlayerWeaponsTableComponent, PlanetsideStatTileComponent]
})
export class PlanetsidePlayerClassesComponent {
    private profileRepository = inject(ProfileRepository);

    /** The class to show in detail, if any. */
    readonly id = input<string>();

    readonly player = inject(PlanetsidePlayerComponent).playerData;
    private readonly profiles = toSignal(this.profileRepository.getProfiles());

    readonly ratio = ratio;
    readonly perMinute = perMinute;
    readonly hours = hours;

    /** The player's faction's classes with their stats, most played first; `undefined` while loading. */
    readonly classes = computed<ClassRow[] | undefined>(() => {
        const player = this.player();
        const profiles = this.profiles();
        if (!player || !profiles) {
            return undefined;
        }
        return profiles
            .filter(profile => profile.factionId === player.factionId)
            .map((profile): ClassRow => ({
                profile,
                stats: (player.profileStats ?? []).find(stat => stat.profileId === profile.profileTypeId) ?? {}
            }))
            .sort((a, b) => (b.stats.playTime ?? 0) - (a.stats.playTime ?? 0));
    });

    readonly selected = computed(() => {
        const id = Number(this.id());
        return id ? this.classes()?.find(row => row.profile.profileTypeId === id) : undefined;
    });

    readonly weapons = computed(() => {
        const selected = this.selected();
        return selected ? classWeapons(this.player()?.weaponStats ?? [], selected.profile.profileTypeId) : [];
    });
}
