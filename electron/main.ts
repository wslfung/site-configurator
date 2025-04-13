import { app, BrowserWindow, Menu, ipcMain, safeStorage } from 'electron';
import { initStore, ElectronStore } from './electronStore';
import serve from 'electron-serve';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';

let mainWindow: BrowserWindow | null = null;

if (isProd) {
  serve({ directory: 'out' });
}

app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  if (isProd) {
    win.loadURL('app://./index.html');
  } else {
    win.webContents.openDevTools();
    win.loadURL('http://localhost:3000');
  }
  win.maximize();
  mainWindow = win;
}

// Set up IPC handlers
function setupIpcHandlers(store: ElectronStore) {
  console.log('Setting up IPC handlers');
  ipcMain.on('set-title', (event, title) => {
    if (mainWindow) {
      mainWindow.setTitle(title);
    }
  });

  ipcMain.on('load-page', (event, path) => {
    console.log('loading page', path);
    if (mainWindow) {
      if (isProd) {
        mainWindow.loadURL(`app://./${path}`);
      } else {
        mainWindow.loadURL(`http://localhost:3000${path}`);
      }
    } else {
      console.log('No main window found');
    }
  });
  // AWS Credentials operations
  ipcMain.handle('store-get-aws-credentials', () => {
    return store.get('awsCredentials');
  });

  ipcMain.handle('store-set-aws-credentials', (event, data) => {
    store.set('awsCredentials', data);
  });

  // Encryption operations
  ipcMain.handle('encrypt-string', (event, text) => {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(text).toString('base64');
    }
    return null;
  });

  ipcMain.handle('decrypt-string', (event, encryptedBase64) => {
    if (safeStorage.isEncryptionAvailable() && encryptedBase64) {
      try {
        return safeStorage.decryptString(Buffer.from(encryptedBase64, 'base64')).toString();
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    }
    return null;
  });
};

const menu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        click: () => {
          if (isProd) {
            mainWindow?.loadURL('app://./settings');
          } else {
            mainWindow?.loadURL('http://localhost:3000/settings');
          }
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }
]);


app.whenReady().then(async () => {
  const store = await initStore();
  createWindow();
  Menu.setApplicationMenu(menu);
  setupIpcHandlers(store);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  // Handle encryption requests

});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
