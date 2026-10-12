import { TestBed } from '@angular/core/testing';
import { PlanetsidePlayerStatsSiegeCardComponent } from './planetside-player-stats-siege-card.component';

describe('PlanetsidePlayerStatsSiegeCardComponent', () => {
    const render = (captured: number, defended: number) => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsSiegeCardComponent);
        fixture.componentRef.setInput('captured', captured);
        fixture.componentRef.setInput('defended', defended);
        fixture.detectChanges();
        return fixture;
    };

    it('shows the siege level, the captured and defended counts, and the gauge', () => {
        const fixture = render(3000, 6000);

        expect(fixture.componentInstance.siegeLevel).toBe(50);
        const text = fixture.nativeElement.textContent;
        expect(text).toContain('50.00');
        expect(text).toContain('3,000');
        expect(text).toContain('6,000');
        expect(fixture.nativeElement.querySelector('svg path.progress')).not.toBeNull();
        expect(fixture.componentInstance.gaugeValue()).toBe(50);
        expect(fixture.componentInstance.lean()).toBe('Defender');
    });

    it('caps the gauge at 100 and labels capture-heavy players as attackers', () => {
        const fixture = render(200, 100);

        expect(fixture.componentInstance.gaugeValue()).toBe(100);
        expect(fixture.componentInstance.lean()).toBe('Attacker');
    });

    it('calls near-equal captures and defends balanced', () => {
        expect(render(95, 100).componentInstance.lean()).toBe('Balanced');
    });
});
