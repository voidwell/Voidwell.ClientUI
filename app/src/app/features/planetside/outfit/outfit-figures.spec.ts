import { OutfitMemberDetails } from '@core/api/models/ps2/outfit.model';
import { accuracy, hsr, isWithin, kdr, mean, median, siege, spm, timeAgo } from './outfit-figures';

const NOW = Date.parse('2026-10-24T12:00:00Z');
const member = (stats?: OutfitMemberDetails['lifetimeStats']): OutfitMemberDetails => ({ memberSinceDate: '2020-01-01T00:00:00Z', rankOrdinal: 1, lifetimeStats: stats });

describe('outfit figures', () => {
    it('divides a member\'s stats into ratios', () => {
        const m = member({ weaponKills: 300, weaponDeaths: 200, weaponHitCount: 50, weaponFireCount: 200, weaponHeadshots: 90, facilityCaptureCount: 30, facilityDefendedCount: 60, weaponScore: 6000, weaponPlayTime: 1200 });

        expect(kdr(m)).toBe(1.5);
        expect(accuracy(m)).toBe(0.25);
        expect(hsr(m)).toBe(0.3);
        expect(siege(m)).toBe(50);
        expect(spm(m)).toBe(300);
    });

    it('has no ratio where there is nothing to divide by', () => {
        expect(kdr(member())).toBeNull();
        expect(kdr(member({ weaponKills: 5, weaponDeaths: 0 }))).toBeNull();
        expect(spm(member({ weaponScore: 5 }))).toBeNull();
    });

    it('averages and finds the median', () => {
        expect(mean([1, 2, 6])).toBe(3);
        expect(median([5, 1, 3])).toBe(3);
        expect(median([1, 2, 3, 4])).toBe(2.5);
        expect(mean([])).toBeNull();
        expect(median([])).toBeNull();
    });

    it('says how long ago a date was', () => {
        const ago = (ms: number) => timeAgo(new Date(NOW - ms).toISOString(), NOW);
        const hour = 3600e3;
        const day = 24 * hour;

        expect(ago(10 * 60e3)).toBe('Just now');
        expect(ago(2 * hour)).toBe('2 hours ago');
        expect(ago(1.5 * day)).toBe('Yesterday');
        expect(ago(5 * day)).toBe('5 days ago');
        expect(ago(21 * day)).toBe('3 weeks ago');
        expect(ago(120 * day)).toBe('4 months ago');
        expect(ago(800 * day)).toBe('2 years ago');
        expect(timeAgo(undefined, NOW)).toBe('');
    });

    it('tells whether a date is within a period', () => {
        expect(isWithin(new Date(NOW - 3 * 24 * 3600e3).toISOString(), 7, NOW)).toBe(true);
        expect(isWithin(new Date(NOW - 9 * 24 * 3600e3).toISOString(), 7, NOW)).toBe(false);
        expect(isWithin(undefined, 7, NOW)).toBe(false);
    });
});
