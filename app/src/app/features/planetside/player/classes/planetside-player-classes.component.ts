import { Component, inject, effect, untracked, input } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { RouterLink } from '@angular/router';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { ProfileRepository } from '@core/api/ps2/profile.repository';
import { CharacterDetails, CharacterDetailsProfileStat, CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { Profile } from '@core/api/models/ps2/reference.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { PlanetsidePlayerWeaponsTableComponent } from '../weapons-table/planetside-player-weapons-table.component';
import { DecimalPipe } from '@angular/common';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { ProfilesDataSource, ProfileRow } from './planetside-player-classes.data-source';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    templateUrl: './planetside-player-classes.component.html',
    styleUrls: ['./planetside-player-classes.component.css'],
    imports: [LoaderComponent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, RouterLink, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter, PlanetsidePlayerWeaponsTableComponent, DecimalPipe, DgcImageUrlPipe]
})

export class PlanetsidePlayerClassesComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);
    private profileRepository = inject(ProfileRepository);
    readonly id = input<string>();

    playerData: CharacterDetails;
    private profileList = toSignal(this.profileRepository.getProfiles());

    private isLoading: boolean;
    private profiles: ProfileRow[];
    private profileId: number;
    private profile: ProfileRow = null;
    private profileWeapons: CharacterDetailsWeaponStat[] = [];

    private profilesDataSource: DataSource<ProfileRow>;

    constructor() {
        const planetsidePlayer = this.planetsidePlayer;

        this.isLoading = true;
        effect(() => {
            const data = planetsidePlayer.playerData();
            const profiles = this.profileList();

            untracked(() => {
                if (!profiles) {
                    return;
                }

                this.playerData = data;

                if (this.playerData !== null) {
                    this.filterProfiles(profiles);

                    if (this.profileId) {
                        this.setupProfile(this.profileId);
                    }
                }
                this.isLoading = false;
            });
        });

        effect(() => {
            const id = this.id();

            untracked(() => {
                this.profile = null;
                this.profileWeapons = [];

                this.profileId = parseInt(id);

                if (!this.isLoading && this.profileId) {
                    this.setupProfile(this.profileId);
                }
            });
        });
    }

    private filterProfiles(data: Profile[]) {
        const profiles: ProfileRow[] = [];

        for (let i = 0; i < data.length; i++) {
            const profile = data[i];
            if (profile.factionId === this.playerData.factionId) {
                profiles.push({ ...profile, stats: {} });
            }
        }

        this.playerData.profileStats.forEach(function (d: CharacterDetailsProfileStat) {
            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i].profileTypeId === d.profileId) {
                    profiles[i].stats = d;
                }
            }
        });

        this.profiles = profiles.sort(this.sortProfiles);
        this.profilesDataSource = new ProfilesDataSource(this.profiles);
    }

    private setupProfile(profileId: number) {
        for (let k = 0; k < this.profiles.length; k++) {
            if (this.profiles[k].profileTypeId === profileId) {
                this.profile = this.profiles[k];
                break;
            }
        }

        const PROFILE = {
            INFILTRATOR: 1,
            LIGHTASSAULT: 3,
            COMBATMEDIC: 4,
            ENGINEER: 5,
            HEAVYASSAULT: 6,
            MAX: 7
        };

        const profileWeapons: CharacterDetailsWeaponStat[] = [];
        this.playerData.weaponStats.forEach(function (weapon) {
            switch (weapon.category) {
                case 'AA MAX (Left)':
                case 'AA MAX (Right)':
                case 'AI MAX (Left)':
                case 'AI MAX (Right)':
                case 'AV MAX (Left)':
                case 'AV MAX (Right)':
                    if (profileId === PROFILE.MAX) {
                        profileWeapons.push(weapon);
                    }
                    break;
                case 'SMG':
                    if (profileId === PROFILE.ENGINEER || profileId === PROFILE.LIGHTASSAULT || profileId === PROFILE.INFILTRATOR) {
                        profileWeapons.push(weapon);
                    }
                    break;
                case 'Assault Rifle':
                    if (profileId === PROFILE.COMBATMEDIC) {
                        profileWeapons.push(weapon);
                    }
                    break;
                case 'Carbine':
                    if (profileId === PROFILE.ENGINEER || profileId === PROFILE.LIGHTASSAULT) {
                        profileWeapons.push(weapon);
                    }
                    break;
                case 'Battle Rifle':
                case 'Heavy Gun':
                case 'LMG':
                    if (profileId === PROFILE.HEAVYASSAULT) {
                        profileWeapons.push(weapon);
                    }
                    break;
                case 'Crossbow':
                case 'Sniper Rifle':
                case 'Pistol':
                    if (profileId === PROFILE.INFILTRATOR) {
                        profileWeapons.push(weapon);
                    }
                    break;
            }
        });

        this.profileWeapons = profileWeapons;
    }

    private sortProfiles(a: ProfileRow, b: ProfileRow) {
        if (a.stats.score < b.stats.score)
            return 1
        if (a.stats.score > b.stats.score)
            return -1;
        return 0;
    }

}

