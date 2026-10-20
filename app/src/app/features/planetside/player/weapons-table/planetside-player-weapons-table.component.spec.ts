import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { PerformanceGrades } from '../../data/performance-grades.service';
import { PlanetsidePlayerWeaponsTableComponent } from './planetside-player-weapons-table.component';

const weapon = (itemId: number, name: string, kills: number, deaths: number, extra: Partial<CharacterDetailsWeaponStat> = {}, killDeathRatioDelta?: number): CharacterDetailsWeaponStat =>
    ({ itemId, name, category: 'Carbine', ...extra, stats: { kills, deaths, fireCount: 100, hitCount: 25, headshots: 1, playTime: 3600, killDeathRatioDelta } });

const WEAPONS = [
    weapon(1, 'Orion', 500, 250, {}, 0.5),
    weapon(2, 'Gauss SAW', 900, 300),
    weapon(3, 'Plasma Grenade', 700, 0),
    weapon(4, 'M20 Basilisk', 50, 10, { vehicleId: 2, category: 'Sunderer Front Gunner' }),
    weapon(5, 'Unused', 0, 0),
    ...Array.from({ length: 15 }, (_, i) => weapon(100 + i, `Pistol ${i}`, 1, 1))
];

describe('PlanetsidePlayerWeaponsTableComponent', () => {
    const setup = (weapons: CharacterDetailsWeaponStat[]) => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: PerformanceGrades, useValue: { grades: signal([{ grade: 'A', delta: 0 }, { grade: 'F', delta: -99 }]) } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerWeaponsTableComponent);
        fixture.componentRef.setInput('weapons', weapons);
        fixture.detectChanges();
        return fixture;
    };
    const names = (element: HTMLElement) =>
        Array.from(element.querySelectorAll<HTMLElement>('tr.weapon-row .weapon-name .truncate')).map(e => e.textContent);

    it('lists the weapons with kills, most kills first', () => {
        const element = setup(WEAPONS).nativeElement as HTMLElement;

        expect(names(element).slice(0, 4)).toEqual(['Gauss SAW', 'Plasma Grenade', 'Orion', 'M20 Basilisk']);
        expect(names(element)).not.toContain('Unused');
    });

    it('filters by name or category and by infantry or vehicle', () => {
        const fixture = setup(WEAPONS);
        const table = fixture.componentInstance;

        table.search.set('front gunner');
        fixture.detectChanges();
        expect(names(fixture.nativeElement)).toEqual(['M20 Basilisk']);

        table.search.set('');
        table.kind.set('vehicle');
        fixture.detectChanges();
        expect(names(fixture.nativeElement)).toEqual(['M20 Basilisk']);

        table.kind.set('infantry');
        fixture.detectChanges();
        expect(names(fixture.nativeElement)).not.toContain('M20 Basilisk');
    });

    it('only offers the filters on long lists', () => {
        expect(setup(WEAPONS).nativeElement.querySelector('.filters')).not.toBeNull();
        TestBed.resetTestingModule();
        expect(setup(WEAPONS.slice(0, 4)).nativeElement.querySelector('.filters')).toBeNull();
    });

    it('sorts K/D from high to low, weapons without counted deaths last', () => {
        const fixture = setup(WEAPONS.slice(0, 4));
        (fixture.nativeElement.querySelector('th.mat-column-kdr') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(fixture.nativeElement)).toEqual(['M20 Basilisk', 'Gauss SAW', 'Orion', 'Plasma Grenade']);
        expect(fixture.nativeElement.querySelectorAll('tr.weapon-row td.mat-column-kdr')[3].textContent.trim()).toBe('—');
    });

    it('sorts a graded column by its grades on the third and fourth clicks, ungraded weapons last', () => {
        const fixture = setup([
            weapon(1, 'A', 500, 100, {}, -1),
            weapon(2, 'B', 100, 100, {}, 2),
            weapon(3, 'C', 300, 100),
            weapon(4, 'D', 200, 100, {}, 0.5)
        ]);
        const header = fixture.nativeElement.querySelector('th.mat-column-kdr') as HTMLElement;
        const table = fixture.nativeElement.querySelector('table') as HTMLElement;
        const click = () => {
            header.click();
            fixture.detectChanges();
            return names(fixture.nativeElement);
        };

        expect(click()).toEqual(['A', 'C', 'D', 'B']);
        expect(click()).toEqual(['B', 'D', 'C', 'A']);
        expect(table.dataset['gradeSort']).toBeUndefined();
        expect(click()).toEqual(['B', 'D', 'A', 'C']);
        expect(table.dataset['gradeSort']).toBe('kdr');
        expect(click()).toEqual(['A', 'D', 'B', 'C']);
        expect(click()).toEqual(['A', 'C', 'D', 'B']);
        expect(table.dataset['gradeSort']).toBeUndefined();
    });

    it('drops back to sorting by figure on another column', () => {
        const fixture = setup([weapon(1, 'A', 500, 100, {}, -1), weapon(2, 'B', 100, 100, {}, 2)]);
        const kdr = fixture.nativeElement.querySelector('th.mat-column-kdr') as HTMLElement;
        [1, 2, 3].forEach(() => kdr.click());
        (fixture.nativeElement.querySelector('th.mat-column-kills') as HTMLElement).click();
        kdr.click();
        fixture.detectChanges();

        expect(names(fixture.nativeElement)).toEqual(['A', 'B']);
        expect((fixture.nativeElement.querySelector('table') as HTMLElement).dataset['gradeSort']).toBeUndefined();
    });

    it('grades a figure only when the API gave a delta for it', () => {
        const fixture = setup(WEAPONS.slice(0, 2));
        const kdCells = fixture.nativeElement.querySelectorAll('tr.weapon-row td.mat-column-kdr');

        expect(kdCells[0].querySelector('vw-grade')).toBeNull();
        expect(kdCells[1].querySelector('vw-grade').textContent).toBe('A');
    });

    it('fills the Auraxium stripe with progress toward 1,160 kills', () => {
        const fixture = setup([weapon(1, 'Orion', 1500, 500), weapon(2, 'Gauss SAW', 580, 300)]);
        const bars = fixture.nativeElement.querySelectorAll('.auraxium-bar') as NodeListOf<HTMLElement>;

        expect(bars[0].classList).toContain('done');
        expect(bars[0].style.height).toBe('100%');
        expect(bars[0].title).toBe('Auraxium');
        expect(bars[1].classList).not.toContain('done');
        expect(bars[1].style.height).toBe('50%');
        expect(bars[1].title).toBe('50% to Auraxium');
    });

    it('opens a row to the rest of its stats, one at a time', () => {
        const fixture = setup(WEAPONS.slice(0, 2));
        const rows = fixture.nativeElement.querySelectorAll('tr.weapon-row') as NodeListOf<HTMLElement>;

        rows[0].click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('.detail').length).toBe(1);
        expect(fixture.nativeElement.querySelector('tr.weapon-row.open .weapon-name').textContent.trim()).toBe('Gauss SAW');

        rows[1].click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('tr.weapon-row.open .weapon-name').textContent.trim()).toBe('Orion');

        rows[1].click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.detail')).toBeNull();
    });

    it('links the weapon name to its page without opening the row', () => {
        const fixture = setup(WEAPONS.slice(0, 1));
        const link = fixture.nativeElement.querySelector('tr.weapon-row .weapon-link') as HTMLAnchorElement;

        expect(link.getAttribute('href')).toBe('/ps2/item/1');
        link.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.expanded()).toBeNull();
    });

    it('marks the open row\'s tiles that repeat a column, which wide screens hide', () => {
        const fixture = setup(WEAPONS.slice(0, 1));
        (fixture.nativeElement.querySelector('tr.weapon-row') as HTMLElement).click();
        fixture.detectChanges();
        const labels = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLElement>)
            .map(tile => tile.getAttribute('label'));

        expect(labels('.tiles planetside-stat-tile:not(.in-table)')).toEqual(['Score', 'Headshots', 'Shots Fired', 'Shots Hit']);
        expect(labels('.tiles .in-table')).toContain('Accuracy');
    });
});
