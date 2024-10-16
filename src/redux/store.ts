// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice"; // Ensure correct import path
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web
import { combineReducers } from "redux";

// Define persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Specify which reducers you want to persist
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here if needed
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// Create a persistor to sync with localStorage
const persistor = persistStore(store);

export { store, persistor };

// Type definitions for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
