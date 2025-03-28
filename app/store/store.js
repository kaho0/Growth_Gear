// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import queryReducer from "./QuerySlice";

export const store = configureStore({
  reducer: {
    query: queryReducer,
  },
});
