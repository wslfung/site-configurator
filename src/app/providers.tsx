'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/reduxStore';
import CustomThemeProvider from './themeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CustomThemeProvider>
          {children}
        </CustomThemeProvider>
      </PersistGate>
    </Provider>
  );
}
