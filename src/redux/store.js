import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import dubaiMpciReducer from "./reducers/dubaiMpciReducer";
import loginReducer from "./reducers/loginReducer";
import themeReducer from "./reducers/themeReducer";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  DubaiFormFiling: dubaiMpciReducer,
  Login: loginReducer,
  Theme: themeReducer,
});

const store = createStore(rootReducer, compose(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(rootSaga);

export default store;
