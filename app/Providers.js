"use client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import queryReducer from "./store/QuerySlice";
const store = configureStore({
  reducer: {
    query: queryReducer,
  },
});

export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
