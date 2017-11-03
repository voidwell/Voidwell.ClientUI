const actionMaxLimit = 15;

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

        this.setPresent(currentState);
    },

    getLoggedInUserId() {
        if (this.presentState.loggedInUser.user) {
            return this.presentState.loggedInUser.user.profile.sub;
        }
        return null;
    }
};

