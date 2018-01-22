"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var collections_1 = require("@angular/cdk/collections");
var router_1 = require("@angular/router");
var planetside_player_component_1 = require("./../planetside-player.component");
var planetside_api_service_1 = require("./../../planetside-api.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var PlanetsidePlayerClassesComponent = (function () {
    function PlanetsidePlayerClassesComponent(planetsidePlayer, api, route) {
        var _this = this;
        this.planetsidePlayer = planetsidePlayer;
        this.api = api;
        this.route = route;
        this.profile = null;
        this.profileWeapons = [];
        this.isLoading = true;
        this.api.getAllProfiles().subscribe(function (profiles) {
            planetsidePlayer.playerData.subscribe(function (data) {
                _this.playerData = data;
                if (_this.playerData !== null) {
                    _this.filterProfiles(profiles);
                    if (_this.profileId) {
                        _this.setupProfile(_this.profileId);
                    }
                }
            });
            _this.isLoading = false;
        });
        this.routeSub = this.route.params.subscribe(function (params) {
            _this.profile = null;
            _this.profileWeapons = [];
            _this.profileId = params['id'];
            if (!_this.isLoading && _this.profileId) {
                _this.setupProfile(_this.profileId);
            }
        });
    }
    PlanetsidePlayerClassesComponent.prototype.filterProfiles = function (data) {
        var profiles = [];
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
    };
    PlanetsidePlayerClassesComponent.prototype.setupProfile = function (profileId) {
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
    };
    PlanetsidePlayerClassesComponent.prototype.sortProfiles = function (a, b) {
        if (a.stats.score < b.stats.score)
            return 1;
        if (a.stats.score > b.stats.score)
            return -1;
        return 0;
    };
    PlanetsidePlayerClassesComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
    };
    return PlanetsidePlayerClassesComponent;
}());
PlanetsidePlayerClassesComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-player-classes.template.html',
        styleUrls: ['./planetside-player-classes.styles.css']
    }),
    __metadata("design:paramtypes", [planetside_player_component_1.PlanetsidePlayerComponent, planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute])
], PlanetsidePlayerClassesComponent);
exports.PlanetsidePlayerClassesComponent = PlanetsidePlayerClassesComponent;
var ProfilesDataSource = (function (_super) {
    __extends(ProfilesDataSource, _super);
    function ProfilesDataSource(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        return _this;
    }
    ProfilesDataSource.prototype.connect = function () {
        return Observable_1.Observable.of(this.data);
    };
    ProfilesDataSource.prototype.disconnect = function () { };
    return ProfilesDataSource;
}(collections_1.DataSource));
exports.ProfilesDataSource = ProfilesDataSource;
