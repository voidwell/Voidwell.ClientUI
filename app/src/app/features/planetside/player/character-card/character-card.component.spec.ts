import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { playerTrail } from '../player-breadcrumbs';
import { CharacterCardComponent } from './character-card.component';

describe('CharacterCardComponent', () => {
    it('shows the page\'s breadcrumbs, linking all but the current page', () => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                {
                    provide: PlanetsidePlayerComponent,
                    useValue: {
                        playerData: signal({ id: '42', name: 'Someone', factionId: 1, times: {} } as CharacterDetails),
                        breadcrumbs: signal(playerTrail({ label: 'Classes', path: 'classes' }, { label: 'Heavy Assault' }))
                    }
                }
            ]
        });
        const fixture = TestBed.createComponent(CharacterCardComponent);
        fixture.detectChanges();

        const links = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('.breadcrumbs a'));
        expect(links.map(a => [a.textContent, a.getAttribute('href')])).toEqual([['Overview', '/ps2/player/42/stats'], ['Classes', '/ps2/player/42/classes']]);
        expect(fixture.nativeElement.querySelector('.breadcrumbs [aria-current="page"]').textContent).toBe('Heavy Assault');
    });
});
