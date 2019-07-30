export const INIT_PLATFORM = 'INIT_PLATFORM';
export const CHANGE_PLATFORM = 'CHANGE_PLATFORM';

export interface IPlatformState {
    platform: string;
};

export const initialPlatformState: IPlatformState = {
    platform: 'pc'
};

export const platformReducer = (state = initialPlatformState, action): IPlatformState => {
    switch (action.type) {
        case INIT_PLATFORM:
            return state;
        case CHANGE_PLATFORM:
            return Object.assign({}, state, { platform: action.value });
        default:
            return state;
    }
};