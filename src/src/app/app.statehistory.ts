import { LoadUserSuccess } from './store/actions/auth.actions';

const actionMaxLimit = 30;

export default {
    presentState: null,
    actions: [],

    setPresent(state) {
        this.presentState = state;
    },

    push(currentState, action) {
        if (this.actions.length > actionMaxLimit) {
            this.actions.shift();
        }

        this.actions.push(this.stripInfo(action));

        this.setPresent(currentState);
    },

    stripInfo(action) {
        switch (action.type) {
            case LoadUserSuccess:
                return {
                    type: action.type,
                    payload: ''
                };
            default:
                return action;
        }
    }

};

