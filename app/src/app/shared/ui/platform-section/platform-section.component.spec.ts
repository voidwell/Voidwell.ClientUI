import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PLATFORMS, PlatformInfo } from '@core/platform/platforms';
import { PlatformSectionComponent } from './platform-section.component';

@Component({
    imports: [PlatformSectionComponent],
    template: `<vw-platform-section [platform]="platform" [count]="count"><p class="body">content</p></vw-platform-section>`
})
class HostComponent {
    platform: PlatformInfo = PLATFORMS[1];
    count: number | undefined = 3;
}

describe('PlatformSectionComponent', () => {
    const render = () => {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        return fixture;
    };

    it('shows the platform name and its icon', () => {
        const element: HTMLElement = render().nativeElement;

        expect(element.querySelector('.platform-section-name')?.textContent).toBe('PS4-US');
        expect(element.querySelector('mat-icon')?.classList).toContain('mdi-sony-playstation');
    });

    it('shows the count', () => {
        expect(render().nativeElement.querySelector('.platform-section-count')?.textContent).toBe('3');
    });

    it('leaves the count out when none is given', () => {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.componentInstance.count = undefined;
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.platform-section-count')).toBeNull();
    });

    it('shows the content it wraps', () => {
        expect(render().nativeElement.querySelector('.body')?.textContent).toBe('content');
    });

    describe('expander', () => {
        const header = (element: HTMLElement) => element.querySelector('.platform-section-header') as HTMLButtonElement;
        const content = (element: HTMLElement) => element.querySelector('.platform-section-content') as HTMLElement;

        it('starts open', () => {
            const element: HTMLElement = render().nativeElement;

            expect(content(element).hidden).toBe(false);
            expect(header(element).getAttribute('aria-expanded')).toBe('true');
        });

        it('collapses and expands the content when the header is clicked', () => {
            const fixture = render();
            const element: HTMLElement = fixture.nativeElement;

            header(element).click();
            fixture.detectChanges();
            expect(content(element).hidden).toBe(true);
            expect(header(element).getAttribute('aria-expanded')).toBe('false');

            header(element).click();
            fixture.detectChanges();
            expect(content(element).hidden).toBe(false);
        });

        it('keeps the content in the DOM while collapsed', () => {
            const fixture = render();

            header(fixture.nativeElement).click();
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.body')).not.toBeNull();
        });

        it('links the header to the content it controls', () => {
            const element: HTMLElement = render().nativeElement;

            expect(header(element).getAttribute('aria-controls')).toBe(content(element).id);
        });
    });
});
