import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { PlanetsideWorldPlayersComponent } from './planetside-world-players.component';

describe('PlanetsideWorldPlayersComponent', () => {
    it('shows the online players once they arrive', async () => {
        const players = new Subject<OnlineCharacter[]>();
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: PlanetsideWorldComponent, useValue: { getOnlinePlayers: () => players } }]
        });
        const fixture = TestBed.createComponent(PlanetsideWorldPlayersComponent);
        fixture.autoDetectChanges();
        await fixture.whenStable();

        players.next([
            { character: { id: '1', name: 'Alpha', factionId: 1, battleRank: 100 }, loginDate: '2026-10-20T10:00:00Z' },
            { character: { id: '2', name: 'Bravo', factionId: 2, battleRank: 50 }, loginDate: '2026-10-20T10:30:00Z' }
        ] as unknown as OnlineCharacter[]);
        await fixture.whenStable();

        expect(fixture.nativeElement.textContent).toContain('Alpha');
        expect(fixture.nativeElement.textContent).toContain('Bravo');
    });
});
