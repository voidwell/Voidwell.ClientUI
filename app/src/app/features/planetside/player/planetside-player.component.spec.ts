import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { PlanetsidePlayerComponent } from './planetside-player.component';
import { playerTrail } from './player-breadcrumbs';

describe('PlanetsidePlayerComponent', () => {
    it('shows the page\'s breadcrumbs above the character card, linking all but the current page', async () => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: CharacterRepository, useValue: { getCharacter: () => of({ id: '42', name: 'Someone', factionId: 1, times: {} } as CharacterDetails) } }
            ]
        });
        // The cards beside the breadcrumbs need their own data; this test is about the trail
        TestBed.overrideComponent(PlanetsidePlayerComponent, {
            set: { imports: [BreadcrumbsComponent], template: '<vw-breadcrumbs [crumbs]="crumbs()"></vw-breadcrumbs>' }
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerComponent);
        fixture.componentRef.setInput('id', '42');
        fixture.autoDetectChanges();
        await fixture.whenStable();

        fixture.componentInstance.breadcrumbs.set(playerTrail({ label: 'Classes', path: 'classes' }, { label: 'Heavy Assault' }));

        fixture.detectChanges();

        const links = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('.breadcrumbs a'));
        expect(links.map(a => [a.textContent, a.getAttribute('href')])).toEqual([['Overview', '/ps2/player/42/stats'], ['Classes', '/ps2/player/42/classes']]);
        expect(fixture.nativeElement.querySelector('.breadcrumbs [aria-current="page"]').textContent).toBe('Heavy Assault');
    });
});
