import { PlanetsideActionTypes, PlanetsideActions } from '../actions/planetside.actions';

export interface PlanetsideState {
    platform: string;
};

const initialState: PlanetsideState = {
    platform: 'pc'
};
  
export function planetsideReducer(state = initialState, action: PlanetsideActions): PlanetsideState {
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
  