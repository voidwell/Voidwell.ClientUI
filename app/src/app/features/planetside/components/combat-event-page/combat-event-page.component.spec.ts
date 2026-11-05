import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CombatEventHeaderView } from '../combat-event/combat-event-header.component';
import { CombatEventPageComponent } from './combat-event-page.component';

const header: CombatEventHeaderView = {
    title: 'Indar Superiority', subtitle: 'Jaeger › Indar', description: '', start: new Date(2026, 9, 20, 10), end: new Date(2026, 9, 20, 11),
    scores: { vs: 40, nc: 30, tr: 30 }, zoneId: 2
};

describe('CombatEventPageComponent', () => {
    function create(inputs: Record<string, unknown>) {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(CombatEventPageComponent);
        Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    }

    it('holds a place for the cards of the overview while it loads, and keeps the page out of sight', () => {
        const el = create({ loading: true });

        expect(el.querySelectorAll('combat-event-skeleton vw-loader').length).toBeGreaterThan(5);
        expect(el.querySelector('combat-event-header')).toBeNull();
        expect(el.querySelector('div[hidden] router-outlet')).not.toBeNull();
    });

    it('holds a place for a single card while a full page loads', () => {
        const el = create({ loading: true, overview: false });

        expect(el.querySelectorAll('combat-event-skeleton vw-loader')).toHaveLength(2);
    });

    it('shows the breadcrumbs and header once loaded', () => {
        const el = create({ loading: false, header, crumbs: [{ label: 'Alerts', link: '/ps2/alerts' }, { label: 'Indar Superiority' }] });

        expect(el.querySelector('combat-event-skeleton')).toBeNull();
        expect(el.querySelector('vw-breadcrumbs')?.textContent).toContain('Alerts');
        expect(el.querySelector('combat-event-header')?.textContent).toContain('Indar Superiority');
        expect(el.querySelector('div[hidden]')).toBeNull();
    });

    it('shows the error card instead when it could not be loaded', () => {
        const el = create({ loading: false, errorMessage: 'Not found' });

        expect(el.querySelector('vw-error-card')).not.toBeNull();
        expect(el.querySelector('combat-event-skeleton')).toBeNull();
    });
});
