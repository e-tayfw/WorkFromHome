import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice"; // Make sure your slice is correctly imported
import { persistStore, persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from "redux";
// import logger from "redux-logger";
import { thunk } from "redux-thunk";


// Define persist config
const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer, 
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(thunk), 
});

// Create a persistor to sync with localStorage
const persistor = persistStore(store);

export { store, persistor };

// Type definitions for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
