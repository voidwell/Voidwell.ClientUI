import { TestBed } from '@angular/core/testing';
import { PlanetsidePlayerStatsSiegeCardComponent } from './planetside-player-stats-siege-card.component';

describe('PlanetsidePlayerStatsSiegeCardComponent', () => {
    it('draws the gauge and computes the siege level', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsSiegeCardComponent);
        fixture.componentRef.setInput('captured', 30);
        fixture.componentRef.setInput('defended', 60);

        fixture.detectChanges();

        expect(fixture.componentInstance.siegeLevel).toBe(50);
        const svg = fixture.nativeElement.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg.querySelectorAll('path').length).toBeGreaterThan(500); // 500 arc segments plus the pointer
        expect(svg.querySelectorAll('text').length).toBeGreaterThan(0);
    });
});
