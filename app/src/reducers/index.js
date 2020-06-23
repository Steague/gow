import { combineReducers } from "redux";
import theme from "./theme";
import notifications from "./notifications";

export default combineReducers({
    theme,
    notifications
});
