export const addNotification = notification => ({
    type: "ADD_NOTIFICATION",
    payload: notification
});

export const hideNotification = id => {
    console.log("got to the action?", id);
    return {
        type: "HIDE_NOTIFICATION",
        payload: id
    };
};

export const showNotification = id => ({
    type: "SHOW_NOTIFICATION",
    payload: id
});

export const updateNotification = notification => ({
    type: "UPDATE_NOTIFICATION",
    payload: notification
});

export const removeNotification = id => ({
    type: "REMOVE_NOTIFICATION",
    payload: id
});

export const setTheme = theme => ({
    type: "SET_THEME",
    theme
});
