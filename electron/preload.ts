import { contextBridge, ipcRenderer } from 'electron';

import { AWSCredentials } from '../src/types/awsCredentials';

contextBridge.exposeInMainWorld('electronAPI', {
  clearStore: () => {
    ipcRenderer.send('clear-store');
  },
  setTitle: (title: string) => {
    ipcRenderer.send('set-title', title);
  },
  loadPage: (path: string) => {
    ipcRenderer.send('load-page', path);
  },
  getAWSCredentials: async () => {
    return await ipcRenderer.invoke('store-get-aws-credentials') as AWSCredentials | undefined;
  },
  setAWSCredentials: async (data: AWSCredentials) => {
    await ipcRenderer.invoke('store-set-aws-credentials', data);
  },
  getThemePreference: async () => {
    return await ipcRenderer.invoke('store-get-theme-preference') as 'light' | 'dark';
  },
  setThemePreference: async (data: 'light' | 'dark') => {
    await ipcRenderer.invoke('store-set-theme-preference', data);
  },
  encryptString: async (plainText: string) => {
    const encrypted = await ipcRenderer.invoke('encrypt-string', plainText);
    console.log('Encrypted:', encrypted);
    return encrypted;
  },
  decryptString: async (encryptedBase64: string) => {
    const decrypted = await ipcRenderer.invoke('decrypt-string', encryptedBase64);
    return decrypted;
  },  
  openMessageDialog: async (message: string, title: string, buttons: string[], type: 'info' | 'warning' | 'error' | 'question') => {
    await ipcRenderer.invoke('open-message-dialog', message, title, buttons, type);
    return;
  }
});
