import { configureStore } from "@reduxjs/toolkit";
import LoginSlice from "./slices/LoginSlice";

const store = configureStore({
  reducer: {
    LoginSlice: LoginSlice,
  },
});

export default store;
