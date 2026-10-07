import { FactionCodePipe } from './faction-code.pipe';
import { FactionNamePipe } from './faction-name.pipe';

describe('faction pipes', () => {
    it('maps faction ids to codes', () => {
        const pipe = new FactionCodePipe();
        expect(pipe.transform(1)).toBe('VS');
        expect(pipe.transform(2)).toBe('NC');
        expect(pipe.transform(3)).toBe('TR');
        expect(pipe.transform(4)).toBe('NS');
    });

    it('maps faction ids to names', () => {
        const pipe = new FactionNamePipe();
        expect(pipe.transform(1)).toBe('Vanu Sovereignty');
        expect(pipe.transform(2)).toBe('New Conglomerate');
        expect(pipe.transform(3)).toBe('Terran Republic');
    });

    it('returns undefined for unknown factions', () => {
        expect(new FactionCodePipe().transform(99)).toBeUndefined();
    });
});
