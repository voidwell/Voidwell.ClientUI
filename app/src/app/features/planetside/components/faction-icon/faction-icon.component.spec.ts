import { TestBed } from '@angular/core/testing';
import { FactionIconComponent } from './faction-icon.component';

describe('FactionIconComponent', () => {
    const render = (factionId: number) => {
        const fixture = TestBed.createComponent(FactionIconComponent);
        fixture.componentRef.setInput('factionId', factionId);
        fixture.detectChanges();
        return fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
    };

    it('shows the faction\'s emblem, named for screen readers and on hover', () => {
        const img = render(1)!;

        expect(img.getAttribute('src')).toBe('https://census.daybreakgames.com/files/ps2/images/static/94.png');
        expect(img.alt).toBe('Vanu Sovereignty');
        expect(img.title).toBe('Vanu Sovereignty');
        expect(render(4)!.getAttribute('src')).toContain('/93615.png');
    });

    it('shows nothing for a faction without an emblem', () => {
        expect(render(0)).toBeNull();
    });
});
