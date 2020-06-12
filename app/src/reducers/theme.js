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

export default (state = getItem("theme") || "darkly", action) => {
    switch (action.type) {
    case 'SET_THEME':
        const { theme } = action;
        setItem("theme", theme);
        return theme;
    default:
        return state;
    }
}
