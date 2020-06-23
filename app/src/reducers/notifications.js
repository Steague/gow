export default (
    state = [
        // {
        //     id: 0,
        //     header: "",
        //     body: "",
        //     show: true
        // }
    ],
    action
) => {
    switch (action.type) {
        case "ADD_NOTIFICATION": {
            const newState = [...state];
            newState.push(action.payload);
            return newState;
        }
        case "HIDE_NOTIFICATION": {
            const newState = [...state];
            console.log("newState", newState);
            newState.forEach(({ id }, i) => {
                console.log("this the right one?", id, action.payload);
                if (id === action.payload) {
                    newState[i].show = false;
                }
            });
            return newState;
        }
        case "SHOW_NOTIFICATION": {
            const newState = [...state];
            newState.forEach(({ id }, i) => {
                if (id === action.payload) {
                    newState[i].show = true;
                }
            });
            return newState;
        }
        case "UPDATE_NOTIFICATION": {
            const newState = [...state];
            let updated = false;
            newState.forEach(({ id }, i) => {
                if (id === action.payload.id) {
                    newState[i] = { ...newState[i], ...action.payload };
                    updated = true;
                }
            });
            if (!updated) {
                newState.push(action.payload);
            }
            return newState;
        }
        case "REMOVE_NOTIFICATION": {
            return [...state].filter(({ id }) => id !== action.payload);
        }
        default: {
            return state;
        }
    }
};
