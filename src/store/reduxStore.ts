import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import lambdaFormSlice from './lambdaFormSlice';
import themePreferenceFormSlice from './themePreferenceFormSlice';

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['lambdaForm', 'themePreferenceForm'] // Only persist awsCredentialsForm
};

const rootReducer = combineReducers({
  lambdaForm: lambdaFormSlice,
  themePreferenceForm: themePreferenceFormSlice
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
