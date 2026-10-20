import { playerTrail } from './player-breadcrumbs';

describe('playerTrail', () => {
    it('is just Overview on the overview', () => {
        expect(playerTrail()).toEqual([{ label: 'Overview' }]);
    });

    it('starts at the overview and leaves the current page unlinked', () => {
        expect(playerTrail({ label: 'Classes', path: 'classes' }, { label: 'Heavy Assault' })).toEqual([
            { label: 'Overview', path: 'stats' },
            { label: 'Classes', path: 'classes' },
            { label: 'Heavy Assault' }
        ]);
        expect(playerTrail({ label: 'Classes', path: 'classes' })).toEqual([{ label: 'Overview', path: 'stats' }, { label: 'Classes' }]);
    });
});
