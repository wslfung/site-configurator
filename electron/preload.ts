import { contextBridge, ipcRenderer } from 'electron';

import { AWSCredentialsFormData } from '../src/types/awsCredentialsForm';

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
    return await ipcRenderer.invoke('store-get-aws-credentials') as AWSCredentialsFormData | undefined;
  },
  setAWSCredentials: async (data: AWSCredentialsFormData) => {
    await ipcRenderer.invoke('store-set-aws-credentials', data);
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
});
