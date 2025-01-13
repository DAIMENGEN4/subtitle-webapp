import sessionStorage from "redux-persist/lib/storage/session";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    whitelist: ["static-persist", "session-persist"],
};

export const staticPersistConfig = {
    key: "static-persist",
    storage: AsyncStorage,
}

export const sessionPersistConfig = {
    key: "session-persist",
    storage: sessionStorage,
}