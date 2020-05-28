const theme = (state = {
    theme: "darkly"
}, action) => {
    switch (action.type) {
    case 'SET_THEME':
        const { theme } = action;
        console.log({theme});
        return {
            ...state,
            theme
        };
    default:
        return state;
    }
}

export default theme;
