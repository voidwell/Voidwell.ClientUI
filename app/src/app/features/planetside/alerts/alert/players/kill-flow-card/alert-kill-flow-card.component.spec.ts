import { TestBed } from '@angular/core/testing';
import { CombatReportFactionKills } from '@core/api/models/ps2/combat-report.model';
import { AlertKillFlowCardComponent } from './alert-kill-flow-card.component';

const k = (attackerFactionId: number, victimFactionId: number, kills: number): CombatReportFactionKills => ({ attackerFactionId, victimFactionId, kills });

describe('AlertKillFlowCardComponent', () => {
    const render = (kills: CombatReportFactionKills[]) => {
        const fixture = TestBed.createComponent(AlertKillFlowCardComponent);
        fixture.componentRef.setInput('kills', kills);
        fixture.detectChanges();
        return { fixture, el: fixture.nativeElement as HTMLElement };
    };

    const sample = [k(1, 1, 4), k(1, 2, 300), k(1, 3, 100), k(2, 1, 200), k(3, 1, 150), k(2, 3, 50), k(3, 2, 75)];
    const cells = (el: HTMLElement, row: number) =>
        Array.from(el.querySelectorAll('tbody tr')[row].querySelectorAll('td')).map(td => td.textContent.trim());

    it('shows the grid with team kills apart and deaths to enemies', () => {
        const { el } = render(sample);

        expect(cells(el, 0)).toEqual(['—', '300', '100', '400', '4']);
        expect(Array.from(el.querySelectorAll('tfoot td')).map(td => td.textContent.trim()).slice(0, 3)).toEqual(['350', '375', '150']);
    });

    it('shows who came out ahead in each pair', () => {
        const { el } = render(sample);

        expect(Array.from(el.querySelectorAll('.pair-edge')).map(e => e.textContent.trim())).toEqual(['VS +100', 'TR +50', 'TR +25']);
    });

    it('switches the figures to shares', () => {
        const { fixture, el } = render(sample);
        fixture.componentInstance.mode.set('share');
        fixture.detectChanges();

        expect(cells(el, 0).slice(1, 3)).toEqual(['75%', '25%']);
    });

    it('renders nothing without kills between factions', () => {
        const { el } = render([k(1, 1, 3)]);

        expect(el.querySelector('mat-card')).toBeNull();
    });
});
