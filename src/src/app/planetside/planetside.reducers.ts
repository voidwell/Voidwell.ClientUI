import { combineReducers } from 'redux';
import { platformReducer } from './reducers';

export default combineReducers({
    platform: platformReducer
});
