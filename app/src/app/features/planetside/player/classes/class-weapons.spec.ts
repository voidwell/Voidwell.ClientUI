import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { PROFILE, classWeapons } from './class-weapons';

const weapon = (itemId: number, category: string): CharacterDetailsWeaponStat => ({ itemId, category });

describe('classWeapons', () => {
    const weapons = [
        weapon(1, 'SMG'), weapon(2, 'Carbine'), weapon(3, 'Assault Rifle'), weapon(4, 'LMG'), weapon(5, 'Sniper Rifle'),
        weapon(6, 'AI MAX (Left)'), weapon(7, 'Pistol'), weapon(8, 'Knife'), { itemId: 9 }
    ];
    const ids = (profileTypeId: number) => classWeapons(weapons, profileTypeId).map(w => w.itemId);

    it('credits each weapon category to its classes', () => {
        expect(ids(PROFILE.INFILTRATOR)).toEqual([1, 5, 7]);
        expect(ids(PROFILE.LIGHT_ASSAULT)).toEqual([1, 2]);
        expect(ids(PROFILE.COMBAT_MEDIC)).toEqual([3]);
        expect(ids(PROFILE.ENGINEER)).toEqual([1, 2]);
        expect(ids(PROFILE.HEAVY_ASSAULT)).toEqual([4]);
        expect(ids(PROFILE.MAX)).toEqual([6]);
    });

    it('credits nothing to an unknown class', () => {
        expect(ids(99)).toEqual([]);
    });
});
