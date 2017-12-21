import { Component, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { PlanetsidePlayerComponent } from './../planetside-player.component';
import { PlanetsideApi } from './../../planetside-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
    templateUrl: './planetside-player-classes.template.html',
    styleUrls: ['./planetside-player-classes.styles.css']
})

export class PlanetsidePlayerClassesComponent implements OnDestroy {
    private routeSub: any;
    private isLoading: boolean;
    private profiles: any[];
    private playerData: any;
    private profileId: string;
    private profile: any = null;
    private profileWeapons = [];

    private profilesDataSource: DataSource<any>;

    constructor(private planetsidePlayer: PlanetsidePlayerComponent, private api: PlanetsideApi, private route: ActivatedRoute,) {
        this.isLoading = true;
        this.api.getAllProfiles().subscribe(profiles => {
            planetsidePlayer.playerData.subscribe(data => {
                this.playerData = data;

                if (this.playerData !== null) {
                    this.filterProfiles(profiles);

                    if (this.profileId) {
                        this.setupProfile(this.profileId);
                    }
                }
            });
            
            this.isLoading = false;
        });

        this.routeSub = this.route.params.subscribe(params => {
            this.profile = null;
            this.profileWeapons = [];

            this.profileId = params['id'];

            if (!this.isLoading && this.profileId) {
                this.setupProfile(this.profileId);
            }
        });
    }

    private filterProfiles(data: any) {
        let profiles = [];

        for (var i = 0; i < data.length; i++) {
            var profile = data[i];
            if (profile.factionId === this.playerData.factionId) {
                profile.stats = {};
                profiles.push(profile);
            }
        }

        this.playerData.profileStats.forEach(function (d) {
            for (var i = 0; i < profiles.length; i++) {
                if (profiles[i].profileTypeId === d.profileId) {
                    profiles[i].stats = d;
                }
            }
        });

        this.profiles = profiles.sort(this.sortProfiles);
        this.profilesDataSource = new ProfilesDataSource(this.profiles);
    }

    private setupProfile(profileId) {
        for (var k = 0; k < this.profiles.length; k++) {
            if (this.profiles[k].profileTypeId === profileId) {
                this.profile = this.profiles[k];
                break;
            }
        }

        var PROFILE = {
            INFILTRATOR: '1',
            LIGHTASSAULT: '3',
            COMBATMEDIC: '4',
            ENGINEER: '5',
            HEAVYASSAULT: '6',
            MAX: '7'
        };

        var profileWeapons = [];
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

    private sortProfiles(a, b) {
        if (a.stats.score < b.stats.score)
            return 1
        if (a.stats.score > b.stats.score)
            return -1;
        return 0;
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

export class ProfilesDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        return Observable.of(this.data);
    }

    disconnect() { }
}