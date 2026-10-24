import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { CharacterCardComponent } from './character-card.component';

describe('CharacterCardComponent', () => {
    it('shows the player and their outfit, with no breadcrumbs of its own', () => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                {
                    provide: PlanetsidePlayerComponent,
                    useValue: {
                        playerData: signal({
                            id: '42', name: 'Someone', factionId: 1, battleRank: 100, world: 'Emerald', times: {},
                            outfit: { id: '7', name: 'Voidwell Veterans', alias: 'VKTZ' }
                        } as unknown as CharacterDetails)
                    }
                }
            ]
        });
        const fixture = TestBed.createComponent(CharacterCardComponent);
        fixture.detectChanges();
        const el: HTMLElement = fixture.nativeElement;

        expect(el.querySelector('.player-name')?.textContent).toContain('Someone');
        expect(el.querySelector('.outfit-link')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('[VKTZ] Voidwell Veterans');
        expect(el.querySelector('vw-breadcrumbs')).toBeNull();
    });
});
