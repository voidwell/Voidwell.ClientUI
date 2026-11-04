import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ChipOption, ChipsComponent } from './vw-chips.component';

@Component({
    imports: [ChipsComponent],
    template: `<vw-chips label="Kind" [options]="options" [value]="value()" (choose)="value.set($event)" [disabled]="disabled()" />`
})
class HostComponent {
    readonly options: ChipOption<string | null>[] = [
        { value: null, label: 'All', count: 12 },
        { value: 'a', label: 'Alpha', count: 0, countClass: 'faction-vs-text' },
        { value: 'b', label: 'Beta' }
    ];
    readonly value = signal<string | null>('a');
    readonly disabled = signal(false);
}

function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const chips = () => [...fixture.nativeElement.querySelectorAll('button.vw-chip')] as HTMLButtonElement[];
    return { fixture, chips };
}

describe('ChipsComponent', () => {
    it('shows a chip for each option with its count, and marks the selected one', () => {
        const { fixture, chips } = create();

        expect(chips().map(chip => chip.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['All 12', 'Alpha 0', 'Beta']);
        expect(chips().map(chip => chip.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
        expect(chips().map(chip => chip.classList.contains('on'))).toEqual([false, true, false]);
        expect(fixture.nativeElement.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Kind');
    });

    it('classes the count of an option that asks for it', () => {
        const { chips } = create();

        expect(chips()[1].querySelector('.vw-chip-count')?.classList).toContain('faction-vs-text');
        expect(chips()[2].querySelector('.vw-chip-count')).toBeNull();
    });

    it('selects the chip that is clicked, including the one whose value is null', () => {
        const { fixture, chips } = create();

        chips()[2].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBe('b');
        expect(chips()[2].classList.contains('on')).toBe(true);

        chips()[0].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBeNull();
        expect(chips()[0].classList.contains('on')).toBe(true);
    });

    it('can be disabled', () => {
        const { fixture, chips } = create();

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect(chips().every(chip => chip.disabled)).toBe(true);
    });

    describe('picking several at once', () => {
        @Component({
            imports: [ChipsComponent],
            template: `<vw-chips [options]="options" [values]="picked()" (choose)="toggle($event)" />`
        })
        class MultiHostComponent {
            readonly options: ChipOption<string>[] = [{ value: 'a', label: 'Alpha', swatch: '#ff0000' }, { value: 'b', label: 'Beta' }];
            readonly picked = signal<string[]>(['a']);
            toggle(value: string) {
                this.picked.update(picked => picked.includes(value) ? picked.filter(p => p !== value) : [...picked, value]);
            }
        }

        it('marks every picked chip and reports the one clicked', () => {
            const fixture = TestBed.createComponent(MultiHostComponent);
            fixture.detectChanges();
            const chips = () => [...fixture.nativeElement.querySelectorAll('button.vw-chip')] as HTMLButtonElement[];
            expect(chips().map(chip => chip.classList.contains('on'))).toEqual([true, false]);

            chips()[1].click();
            fixture.detectChanges();
            expect(chips().map(chip => chip.getAttribute('aria-pressed'))).toEqual(['true', 'true']);

            chips()[0].click();
            fixture.detectChanges();
            expect(chips().map(chip => chip.classList.contains('on'))).toEqual([false, true]);
        });

        it('shows the colour dot of an option that has one', () => {
            const fixture = TestBed.createComponent(MultiHostComponent);
            fixture.detectChanges();
            const swatches = [...fixture.nativeElement.querySelectorAll('.stat-swatch')] as HTMLElement[];

            expect(swatches.length).toBe(1);
            expect(swatches[0].style.background).toBe('rgb(255, 0, 0)');
        });
    });

    describe('links', () => {
        @Component({
            imports: [ChipsComponent],
            template: `<vw-chips [options]="options" />`
        })
        class LinkHostComponent {
            readonly options: ChipOption<string>[] = [{ value: 'indar', label: 'Indar', link: '/ps2/map/2' }, { value: 'hossin', label: 'Hossin', link: '/ps2/map/4' }];
        }

        it('renders anchors to the routes, marking the active one', async () => {
            TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] });
            const fixture = TestBed.createComponent(LinkHostComponent);
            await TestBed.inject(Router).navigateByUrl('/ps2/map/4');
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            const links = [...fixture.nativeElement.querySelectorAll('a.vw-chip')] as HTMLAnchorElement[];

            expect(links.map(link => link.getAttribute('href'))).toEqual(['/ps2/map/2', '/ps2/map/4']);
            expect(links.map(link => link.classList.contains('on'))).toEqual([false, true]);
            expect(fixture.nativeElement.querySelector('button')).toBeNull();
        });
    });
});
