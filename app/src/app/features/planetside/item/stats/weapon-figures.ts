/** Health plus shields of a standard infantry player, for shots and time to kill. */
export const INFANTRY_HEALTH = 1000;

/** Rounds per minute from the time between shots; `null` when the weapon has no fire rate. */
export function roundsPerMinute(fireRateMs: number | null | undefined): number | null {
    return fireRateMs ? 60000 / fireRateMs : null;
}

/** Body shots to kill standard infantry at a given damage per shot. */
export function shotsToKill(damage: number | null | undefined): number | null {
    return damage ? Math.ceil(INFANTRY_HEALTH / damage) : null;
}

/** Milliseconds to kill standard infantry: the time between shots for every shot after the first, all hitting. */
export function timeToKill(damage: number | null | undefined, fireRateMs: number | null | undefined): number | null {
    const shots = shotsToKill(damage);
    return shots && fireRateMs ? (shots - 1) * fireRateMs : null;
}
