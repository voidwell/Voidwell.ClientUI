import { CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';

/** Profile type ids of the classes. */
export const PROFILE = {
    INFILTRATOR: 1,
    LIGHT_ASSAULT: 3,
    COMBAT_MEDIC: 4,
    ENGINEER: 5,
    HEAVY_ASSAULT: 6,
    MAX: 7
} as const;

/** The weapon categories credited to each class. */
const CLASS_CATEGORIES: Record<number, string[]> = {
    [PROFILE.INFILTRATOR]: ['SMG', 'Crossbow', 'Sniper Rifle', 'Pistol'],
    [PROFILE.LIGHT_ASSAULT]: ['SMG', 'Carbine'],
    [PROFILE.COMBAT_MEDIC]: ['Assault Rifle'],
    [PROFILE.ENGINEER]: ['SMG', 'Carbine'],
    [PROFILE.HEAVY_ASSAULT]: ['Battle Rifle', 'Heavy Gun', 'LMG'],
    [PROFILE.MAX]: ['AA MAX (Left)', 'AA MAX (Right)', 'AI MAX (Left)', 'AI MAX (Right)', 'AV MAX (Left)', 'AV MAX (Right)']
};

/** The player's weapons that belong to a class, by weapon category. */
export function classWeapons(weapons: CharacterDetailsWeaponStat[], profileTypeId: number): CharacterDetailsWeaponStat[] {
    const categories = CLASS_CATEGORIES[profileTypeId] ?? [];
    return weapons.filter(weapon => categories.includes(weapon.category ?? ''));
}
