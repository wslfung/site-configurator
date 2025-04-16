import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
let sessionStorageBackend: any = null;
if (typeof window !== 'undefined') {
  sessionStorageBackend = require('redux-persist/lib/storage/session').default;
} else {
  // fallback to noop storage to avoid warnings in SSR/Electron
  sessionStorageBackend = {
    getItem: (_: any) => Promise.resolve(null),
    setItem: (_: any, __: any) => Promise.resolve(),
    removeItem: (_: any) => Promise.resolve(),
  };
}

import themePreferenceFormSlice from './themePreferenceFormSlice';
import lambdaFormSlice from './lambdaFormSlice';
import codeArtifactFormSlice from './codeArtifactFormSlice';

const persistConfig = {
  key: 'root',
  storage: sessionStorageBackend,
  whitelist: ['themePreferenceForm', 'lambdaForm', 'codeArtifactForm'],
};

const rootReducer = combineReducers({
  codeArtifactForm: codeArtifactFormSlice,
  themePreferenceForm: themePreferenceFormSlice,
  lambdaForm: lambdaFormSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
