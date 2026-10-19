import { Ps2Platform } from '@core/api/models/ps2/common.model';
import { loadSavedPlatform } from '../../platforms';
import { PlanetsideActionTypes, PlanetsideActions } from '../actions/planetside.actions';

export interface PlanetsideState {
    platform: Ps2Platform;
};

/** Starts on the platform the user last picked; the URL of a PlanetSide page overrides it (see `platformGuard`). */
const initialState = (): PlanetsideState => ({
    platform: loadSavedPlatform()
});

export function planetsideReducer(state = initialState(), action: PlanetsideActions): PlanetsideState {
    switch (action.type) {
        case PlanetsideActionTypes.CHANGE_PLATFORM: {
            return {
                ...state,
                platform: action.payload.platform
            };
        }
        default: {
            return state;
        }
    }
}
