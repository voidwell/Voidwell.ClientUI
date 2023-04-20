import { RegistrationActionTypes, RegistrationActions } from '../actions/registration.actions';

export interface RegistrationState {
    completedInfo: boolean;
    completedSecurityQuestions: boolean;
    isSuccess: boolean;
    status: string;
    error: string;
};

const initialState: RegistrationState = {
    completedInfo: false,
    completedSecurityQuestions: false,
    isSuccess: false,
    status: '',
    error: null
};
  
export function registrationReducer(state = initialState, action: RegistrationActions): RegistrationState {
    switch (action.type) {
        case RegistrationActionTypes.REGISTER_USER: {
            return {
                ...state,
                status: 'loading'
            };
        }
        case RegistrationActionTypes.REGISTRATION_SUCCESS: {
            return {
                ...state,
                status: 'active',
                isSuccess: true
            };
        }
        case RegistrationActionTypes.REGISTRATION_FAILURE: {
            return {
                ...state,
                status: 'error',
                error: action.payload.error
            };
        }
        default: {
            return state;
        }
    }
}
  