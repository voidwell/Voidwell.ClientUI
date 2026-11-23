import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PlatformServiceState } from '@core/api/models/ps2/admin.model';
import { ServicesRepository } from '@core/api/ps2/services.repository';
import { ServicesComponent } from './services.component';

const service = (platform: PlatformServiceState['platform'], name: string, isEnabled: boolean, details?: unknown): PlatformServiceState => ({ platform, name, isEnabled, details });
// A fresh list for each test, because the component updates the rows it is given
const services = () => [
    service('pc', 'Event stream', true, { connected: true }),
    service('pc', 'World monitor', false),
    service('ps4us', 'Event stream', true)
];

function create(repository: Partial<ServicesRepository> = {}) {
    TestBed.configureTestingModule({
        providers: [{ provide: ServicesRepository, useValue: { getAllStatuses: () => of(services()), enable: vi.fn(), disable: vi.fn(), ...repository } }]
    });
    const fixture = TestBed.createComponent(ServicesComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
}

const sections = (el: HTMLElement) => [...el.querySelectorAll('vw-platform-section')];
const names = (section: Element) => [...section.querySelectorAll('.service .name')].map(n => n.textContent?.trim());

describe('ServicesComponent', () => {
    it('lists the services of each platform in its own collapsible section, with a count', () => {
        const { el } = create();

        expect(sections(el).map(section => section.querySelector('.platform-section-name')?.textContent?.trim())).toEqual(['PC', 'PS4-US']);
        expect(sections(el).map(section => section.querySelector('.platform-section-count')?.textContent?.trim())).toEqual(['2', '1']);
        expect(names(sections(el)[0])).toEqual(['Event stream', 'World monitor']);
        expect(el.querySelectorAll('mat-card')).toHaveLength(2);
    });

    it('collapses a platform from its header', () => {
        const { fixture, el } = create();
        const [first] = sections(el);

        (first.querySelector('.platform-section-header') as HTMLElement).click();
        fixture.detectChanges();

        expect(first.querySelector('.platform-section-content')?.hasAttribute('hidden')).toBe(true);
        expect(sections(el)[1].querySelector('.platform-section-content')?.hasAttribute('hidden')).toBe(false);
    });

    it('opens the details of a service that has some', () => {
        const { fixture, el } = create();

        expect(el.querySelectorAll('.stat-ghost')).toHaveLength(1);
        expect(el.querySelector('pre.details')).toBeNull();

        (el.querySelector('.stat-ghost') as HTMLElement).click();
        fixture.detectChanges();

        expect(el.querySelector('pre.details')?.textContent).toContain('"connected": true');
    });

    it('turns a service on from its switch, and keeps what the server answers', () => {
        const enable = vi.fn(() => of({ isEnabled: true, name: 'World monitor' }));
        const { fixture, el } = create({ enable } as unknown as Partial<ServicesRepository>);

        const toggle = sections(el)[0].querySelectorAll('mat-slide-toggle button')[1] as HTMLElement;
        expect(toggle.getAttribute('aria-checked')).toBe('false');

        toggle.click();
        fixture.detectChanges();

        expect(enable).toHaveBeenCalledWith('World monitor', 'pc');
        expect(toggle.getAttribute('aria-checked')).toBe('true');
    });

    it('shows who locks a locked service and keeps its switch off limits', () => {
        const locked = { ...service('pc', 'World monitor', false), isLocked: true, lockedBy: 'environment variables' };
        const { el } = create({ getAllStatuses: () => of([service('pc', 'Event stream', true), locked]) });

        const rows = [...sections(el)[0].querySelectorAll('li')];
        expect(rows[0].querySelector('.lock')).toBeNull();
        expect(rows[1].querySelector('.lock')?.textContent?.trim()).toBe('Set by environment variables');

        const toggles = [...el.querySelectorAll('mat-slide-toggle button')] as HTMLButtonElement[];
        expect(toggles[0].disabled).toBe(false);
        expect(toggles[1].disabled).toBe(true);
        expect(toggles[1].getAttribute('aria-describedby')).toBe(rows[1].querySelector('.lock')?.id);
    });

    it('marks a service locked when the server refuses the change', () => {
        const enable = vi.fn(() => throwError(() => new HttpErrorResponse({
            status: 409,
            error: { message: "'World monitor' is locked because it is set by appsettings.json.", lockedBy: 'appsettings.json' }
        })));
        const { fixture, el } = create({ enable } as unknown as Partial<ServicesRepository>);

        const toggle = sections(el)[0].querySelectorAll('mat-slide-toggle button')[1] as HTMLButtonElement;
        toggle.click();
        fixture.detectChanges();

        const row = sections(el)[0].querySelectorAll('li')[1];
        expect(toggle.getAttribute('aria-checked')).toBe('false');
        expect(toggle.disabled).toBe(true);
        expect(row.querySelector('.lock')?.textContent?.trim()).toBe('Set by appsettings.json');
        expect(row.querySelector('vw-error-message')?.textContent).toContain('is locked because it is set by appsettings.json');
    });

    it('shows the error card when the services fail to load', () => {
        const { el } = create({ getAllStatuses: () => throwError(() => new Error('nope')) });

        expect(el.querySelector('vw-error-card')).not.toBeNull();
        expect(sections(el)).toHaveLength(0);
    });
});
