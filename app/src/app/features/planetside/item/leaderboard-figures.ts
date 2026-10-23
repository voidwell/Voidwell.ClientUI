import { WeaponLeaderboardRow } from '@core/api/models/ps2/weapon.model';

/** A leaderboard row's ratios; `null` where there is nothing to divide by, so the figure shows as a dash. */
export const kdr = (row: WeaponLeaderboardRow): number | null => (row.deaths ? row.kills / row.deaths : null);
export const accuracy = (row: WeaponLeaderboardRow): number | null => (row.shotsFired ? row.shotsHit / row.shotsFired : null);
export const hsr = (row: WeaponLeaderboardRow): number | null => (row.kills ? row.headshots / row.kills : null);
export const kph = (row: WeaponLeaderboardRow): number | null => (row.playTime ? row.kills / (row.playTime / 3600) : null);
export const hours = (row: WeaponLeaderboardRow): number => (row.playTime ?? 0) / 3600;

/** The leaderboard's rows per page; the API serves the top 1,000 players a page at a time. */
export const LEADERBOARD_PAGE_SIZE = 50;
