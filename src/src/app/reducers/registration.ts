export const REGISTER_USER = 'REGISTER_USER';
export const REGISTRATION_FAIL = 'REGISTRATION_FAIL';
export const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';

export interface IRegistrationState {
    completedInfo: boolean;
    completedSecurityQuestions: boolean;
    isSuccess: boolean;
    status: string;
    errorMessage: string;
};

export const initialRegistrationState: IRegistrationState = {
    completedInfo: false,
    completedSecurityQuestions: false,
    isSuccess: false,
    status: '',
    errorMessage: null
};

export const registrationReducer = (state = initialRegistrationState, action): IRegistrationState => {
    switch (action.type) {
        case REGISTER_USER:
            return Object.assign({}, state, { status: 'loading' });
        case REGISTER_USER_SUCCESS:
            return Object.assign({}, state, { status: 'active', isSuccess: true });
        case REGISTRATION_FAIL:
            return Object.assign({}, state, { status: 'error', errorMessage: action.error });
        default:
            return state;
    }
};