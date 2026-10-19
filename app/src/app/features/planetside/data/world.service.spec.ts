import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Store, provideState, provideStore } from '@ngrx/store';
import { ChangePlatform } from '@core/platform/store/actions/planetside.actions';
import { reducers } from '@core/platform/store/planetside.states';
import { WorldRepository } from '@core/api/ps2/world.repository';

import { WorldNamePipe } from '../pipes/world-name.pipe';
import { WorldService } from './world.service';

describe('WorldService', () => {
    const getWorlds = vi.fn();
    const getActiveWorlds = vi.fn();

    beforeEach(() => {
        getWorlds.mockReset();
        getWorlds.mockReturnValue(of([{ id: 1, name: 'Osprey' }, { id: 17, name: 'Emerald' }]));
        getActiveWorlds.mockReset();
        getActiveWorlds.mockReturnValue(of([{ id: 1, name: 'Osprey' }]));
        TestBed.configureTestingModule({
            providers: [
                provideStore({}),
                provideState('ps2', reducers.planetside),
                WorldService,
                WorldNamePipe,
                { provide: WorldRepository, useValue: { getWorlds, getActiveWorlds } }
            ]
        });
    });

    it('loads the worlds and names them through the pipe', () => {
        const service = TestBed.inject(WorldService);
        TestBed.tick();

        expect(service.worlds()).toEqual([{ id: 1, name: 'Osprey' }, { id: 17, name: 'Emerald' }]);
        expect(TestBed.inject(WorldNamePipe).transform('17')).toBe('Emerald');
        expect(TestBed.inject(WorldNamePipe).transform(2)).toBeNull();
    });

    it('loads the active worlds separately', () => {
        const service = TestBed.inject(WorldService);
        TestBed.tick();

        expect(service.activeWorlds()).toEqual([{ id: 1, name: 'Osprey' }]);
    });

    it('reloads when the platform changes', () => {
        TestBed.inject(WorldService);
        TestBed.tick();
        expect(getWorlds).toHaveBeenCalledTimes(1);
        expect(getActiveWorlds).toHaveBeenCalledTimes(1);

        TestBed.inject(Store).dispatch(new ChangePlatform({ platform: 'ps4eu' }));
        TestBed.tick();
        expect(getWorlds).toHaveBeenCalledTimes(2);
        expect(getActiveWorlds).toHaveBeenCalledTimes(2);
    });
});
