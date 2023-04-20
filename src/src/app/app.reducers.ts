import { combineReducers } from 'redux';
import stateHistory from './app.statehistory';
import { reducers } from './store/app.states';

const rootReducer = reducer => (state = stateHistory.presentState, action) => {
    switch (action.type) {
        default: {
            const newState = reducer(state, action);
            stateHistory.push(newState, action);
        }
    }

    return stateHistory.presentState;
};

export default rootReducer(combineReducers({
    auth: reducers.auth,
    registration: reducers.registration
}));
