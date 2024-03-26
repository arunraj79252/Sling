import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { apliSlice } from "../api/apiSlice";
import authSlice from "./slice/authSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import themeSlice from "./slice/themeSlice";
import chatSlice from "./slice/chatSlice";
import socketSlice from "./slice/socketSlice";
import socketMiddleware from "./middleware/socketMiddleware";
import groupChatSlice from "./slice/groupChatSlice"

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: [apliSlice.reducerPath,'socket']
};
const reducer = combineReducers({
  auth: authSlice,
  theme: themeSlice,
  chat:chatSlice,
  socket:socketSlice,
  groupChat:groupChatSlice,
  [apliSlice.reducerPath]: apliSlice.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {

  // this applies to all keys defined in persistConfig(s)
  storage.removeItem('persist:root')

  state = {} 
}
return reducer(state, action)
}
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apliSlice.middleware,socketMiddleware),
});
export const persistor = persistStore(store);
setupListeners(store.dispatch);
