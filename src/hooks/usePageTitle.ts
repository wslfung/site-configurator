import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const baseTitle = 'Site Configurator';
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;
    
    // Also update the Electron window title if we're in Electron
    if (window.electronAPI) {
      window.electronAPI.setTitle(document.title);
    }
  }, [title]);
};
