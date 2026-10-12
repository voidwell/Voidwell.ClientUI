import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { ProfileRepository } from '@core/api/ps2/profile.repository';
import { PlanetsidePlayerStatsClassUsageCardComponent } from './planetside-player-stats-class-usage-card.component';

describe('PlanetsidePlayerStatsClassUsageCardComponent', () => {
    it('lists the faction classes by playtime and links to the class stats', () => {
        const profiles = [
            { id: 1, profileTypeId: 1, factionId: 1, name: 'Infiltrator', imageId: 0 },
            { id: 2, profileTypeId: 3, factionId: 1, name: 'Light Assault', imageId: 0 },
            { id: 3, profileTypeId: 6, factionId: 1, name: 'Heavy Assault', imageId: 0 },
            { id: 4, profileTypeId: 1, factionId: 2, name: 'Other Faction Infiltrator', imageId: 0 }
        ];
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: ProfileRepository, useValue: { getProfiles: () => of(profiles) } }]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsClassUsageCardComponent);
        fixture.componentRef.setInput('player', {
            id: '42',
            factionId: 1,
            profileStats: [
                { profileId: 3, playTime: 3600 * 25 },
                { profileId: 1, playTime: 3600 * 75 },
                { profileId: 6, playTime: 0 }
            ]
        } as CharacterDetails);

        fixture.detectChanges();

        const names = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.legend .name')).map(e => e.textContent);
        expect(names).toEqual(['Infiltrator', 'Light Assault']);
        expect(fixture.nativeElement.querySelectorAll('svg path').length).toBe(2);
        expect(fixture.nativeElement.textContent).toContain('100h');
        expect(fixture.nativeElement.querySelector('.view-all').getAttribute('href')).toBe('/ps2/player/42/classes');
    });
});
