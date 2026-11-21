import { all } from "redux-saga/effects";
import dubaiMpciSaga from "./dubaiMpciSaga";

export default function* rootSaga() {
  yield all([dubaiMpciSaga()]);
}
