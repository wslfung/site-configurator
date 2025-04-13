import { contextBridge, ipcRenderer, safeStorage } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  loadPage: (path: string) => {
    alert('loadPage called');
    ipcRenderer.send('load-page', path);
  },
  isEncryptionAvailable: () => safeStorage.isEncryptionAvailable(),
  encryptString: async (plainText: string) => {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(plainText).toString('base64');
    }
    return null;
  },
  decryptString: async (encryptedBase64: string) => {
    if (safeStorage.isEncryptionAvailable() && encryptedBase64) {
      try {
        return safeStorage.decryptString(Buffer.from(encryptedBase64, 'base64')).toString();
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    }
    return null;
  },  
});
