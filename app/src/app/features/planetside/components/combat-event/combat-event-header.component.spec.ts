import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ZoneService } from '../../data/zone.service';
import { CombatEventHeaderComponent, formatChange } from './combat-event-header.component';

const minutes = (n: number) => new Date(Date.now() + n * 60000);

function create(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ZoneService, useValue: { zoneName: (): string => 'Indar' } }] });
    const fixture = TestBed.createComponent(CombatEventHeaderComponent);
    for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
    }
    // The countdown ticks on a timer, so the zone never settles: render once instead of waiting for it
    fixture.detectChanges();
    return fixture;
}

const text = (el: HTMLElement, selector: string) => el.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

describe('CombatEventHeaderComponent', () => {
    const base = { title: 'Indar Superiority', subtitle: 'Emerald › Indar', start: minutes(-90), end: minutes(-45) };

    it('shows the duration and end once it is over', () => {
        const el: HTMLElement = create({ ...base, scores: { vs: 41, nc: 33, tr: 26 } }).nativeElement;

        expect(text(el, 'h1')).toBe('Indar Superiority');
        expect(text(el, '.sub')).toBe('Emerald › Indar');
        expect(text(el, '.status')).toContain('Duration');
        expect(text(el, '.status b')).toBe('45 min');
        expect(el.querySelector('.stat-pill.amber')).toBeNull();
        expect(text(el, '.status .stat-hint')).toMatch(/^\w{3} \d+, [\d:]+ [AP]M – /);
    });

    it('shows the time left, and an alarm for an alert, while it runs', () => {
        const running = { ...base, start: minutes(-10), end: minutes(35) };

        const alert: HTMLElement = create({ ...running, alarm: true }).nativeElement;
        expect(alert.querySelector('.stat-pill.amber')?.textContent).toContain('remaining');
        expect(alert.querySelector('vw-alert-indicator')).not.toBeNull();
        expect(text(alert, '.status .stat-hint')).toContain('Started');
    });

    it('has no alarm for an event', () => {
        TestBed.resetTestingModule();
        const event: HTMLElement = create({ ...base, start: minutes(-10), end: minutes(35) }).nativeElement;

        expect(event.querySelector('.stat-pill.amber')).not.toBeNull();
        expect(event.querySelector('vw-alert-indicator')).toBeNull();
    });

    it('shows each faction\'s score in its colour, with the change since the start', () => {
        const el: HTMLElement = create({
            ...base, scores: { vs: 41, nc: 33, tr: 26 }, startScores: { vs: 36, nc: 35, tr: 29 }
        }).nativeElement;
        const values = [...el.querySelectorAll('.stat-tile-value')] as HTMLElement[];

        expect(values.slice(0, 3).map(v => v.textContent?.trim())).toEqual(['41%', '33%', '26%']);
        expect(values.slice(0, 3).map(v => [...v.classList].find(c => c.startsWith('faction-')))).toEqual(['faction-vs-text', 'faction-nc-text', 'faction-tr-text']);
        expect(text(el, '.stat-tile-sub')).toBe('Started at 36% · +5');
    });

    it('describes the score as the end of the event when the start is not known', () => {
        const el: HTMLElement = create({ ...base, scores: { vs: 38, nc: 34, tr: 28 } }).nativeElement;

        expect(text(el, '.stat-tile-sub')).toBe('Territory at the end');
        expect([...el.querySelectorAll('.stat-tile .stat-label')].map(l => l.textContent?.trim())).toEqual(['Vanu Sovereignty', 'New Conglomerate', 'Terran Republic']);
    });

    it('has no faction tiles without scores', () => {
        const el: HTMLElement = create(base).nativeElement;

        expect(el.querySelectorAll('.stat-tile').length).toBe(0);
    });
});

describe('formatChange', () => {
    it('writes a change with its sign', () => {
        expect(formatChange(5)).toBe('+5');
        expect(formatChange(-2.4)).toBe('−2');
        expect(formatChange(0)).toBe('±0');
        expect(formatChange(0.2)).toBe('±0');
    });
});
