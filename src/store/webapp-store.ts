import {persistReducer, persistStore} from "redux-persist";
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import sessionReducer from "@R/store/features/session-slice";
import {persistConfig, sessionPersistConfig} from "@R/store/config";

const reducers = combineReducers({
    session: persistReducer(sessionPersistConfig, sessionReducer),
})

const persistedReducer = persistReducer(persistConfig, reducers);

export const webappStore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(webappStore);
export type WebAppDispatch = typeof webappStore.dispatch;
export type WebAppState = ReturnType<typeof webappStore.getState>;