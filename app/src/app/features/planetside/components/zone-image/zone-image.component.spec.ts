import { TestBed } from '@angular/core/testing';
import { ZoneImageComponent } from './zone-image.component';
import { zoneImageUrl } from './zone-image';

describe('zoneImageUrl', () => {
    it('maps the continents, as a number or a string', () => {
        expect(zoneImageUrl(2)).toBe('/Indar-160.jpg');
        expect(zoneImageUrl('344')).toBe('/Oshur-160.jpg');
    });

    it('is null for a zone without artwork or without an id', () => {
        expect(zoneImageUrl(95)).toBeNull();
        expect(zoneImageUrl(null)).toBeNull();
        expect(zoneImageUrl('nope')).toBeNull();
    });
});

describe('ZoneImageComponent', () => {
    function create(zoneId: number, size?: number) {
        const fixture = TestBed.createComponent(ZoneImageComponent);
        fixture.componentRef.setInput('zoneId', zoneId);
        if (size) fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    }

    it('shows the artwork at the size asked for', () => {
        const img = create(4, 26).querySelector('img') as HTMLImageElement;

        expect(img.getAttribute('src')).toBe('/Hossin-160.jpg');
        expect(img.style.width).toBe('26px');
    });

    it('holds the space with a placeholder when there is no artwork', () => {
        const el = create(95);

        expect(el.querySelector('img')).toBeNull();
        expect(el.querySelector('.placeholder')).not.toBeNull();
    });
});
