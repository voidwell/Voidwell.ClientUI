import { TestBed } from '@angular/core/testing';
import { WeaponInfoResult } from '@core/api/models/ps2/weapon.model';
import { DamageChartComponent } from './damage-chart.component';

describe('DamageChartComponent', () => {
    const render = (weapon: Partial<WeaponInfoResult>) => {
        const fixture = TestBed.createComponent(DamageChartComponent);
        fixture.componentRef.setInput('weapon', weapon as WeaponInfoResult);
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    };

    it('labels where the damage starts and stops dropping', () => {
        const marks = Array.from(render({ maxDamage: 143, maxDamageRange: 10, minDamage: 112, minDamageRange: 65 }).querySelectorAll('.mark')).map(m => m.textContent);

        expect(marks).toEqual(['143 up to 10 m', '112 from 65 m']);
    });

    it('stretches the range past a long drop-off', () => {
        const ticks = Array.from(render({ maxDamage: 200, maxDamageRange: 50, minDamage: 150, minDamageRange: 150 }).querySelectorAll('text.tick')).map(t => t.textContent);

        expect(ticks).toContain('180 m');
    });

    it('says so when the damage never drops', () => {
        const marks = Array.from(render({ maxDamage: 1000, maxDamageRange: 0, minDamage: 1000, minDamageRange: 0 }).querySelectorAll('.mark')).map(m => m.textContent);

        expect(marks).toEqual(['1,000 at every range']);
    });
});
