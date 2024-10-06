import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
	reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type FanthalDispatch = typeof store.dispatch;

export const useFanthalDispatch: () => FanthalDispatch = useDispatch;
export const useFanthalSelector: TypedUseSelectorHook<RootState> = useSelector;
