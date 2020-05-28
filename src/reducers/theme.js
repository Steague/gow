const setItem = (key, obj) => {
    if (!key) return null;
    try {
        localStorage.setItem(key, JSON.stringify(obj));
    }
    catch (err) {
        return null;
    }
};

const getItem = (key) => {
  if (!key) return null;
  try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null;
    }
    catch (err) {
        return null;
    }
}
const defaultState = {
    theme: getItem("theme") || "darkly"
};

const theme = (state = defaultState, action) => {
    switch (action.type) {
    case 'SET_THEME':
        const { theme } = action;
        setItem("theme", theme);
        return {
            ...state,
            theme
        };
    default:
        return state;
    }
}

export default theme;
