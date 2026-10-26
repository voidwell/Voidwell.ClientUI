import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { DashboardComponent } from './dashboard.component';

function create(userRoles: string[]) {
    TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: Store, useValue: { selectSignal: () => signal({ userRoles }) } }]
    });
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
}

const tiles = (el: HTMLElement) => [...el.querySelectorAll('a.tile')].map(tile => [tile.querySelector('strong')?.textContent, tile.getAttribute('href')]);

describe('DashboardComponent', () => {
    it('has a tile for every area for an administrator', () => {
        expect(tiles(create(['Administrator']))).toEqual([['Events', '/admin/events'], ['PSB', '/admin/psb'], ['Blog', '/admin/blog'], ['Status', '/admin/status']]);
    });

    it('has tiles only for the areas the roles allow', () => {
        expect(tiles(create(['Blog']))).toEqual([['Blog', '/admin/blog']]);
    });

    it('says so when the account has no areas', () => {
        const el = create([]);

        expect(tiles(el)).toEqual([]);
        expect(el.textContent).toContain('Your account has no admin areas yet.');
    });
});
