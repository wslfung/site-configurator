import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  loadPage: (path: string) => {
    alert('loadPage called');
    ipcRenderer.send('load-page', path);
  },
});
