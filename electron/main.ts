import { app, BrowserWindow, Menu, ipcMain, safeStorage, dialog, protocol } from 'electron';
import { initStore, ElectronStore } from './electronStore';
import * as path from 'path';

// Get development mode status first

// Add global error handlers to catch and log unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// isDev is already declared at the top of the file
const isProd = app.isPackaged;
let mainWindow: BrowserWindow | null = null;

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
      // win.webContents.openDevTools();
      win.loadURL(`file://${__dirname}/../next/index.html`);
    } else {
      win.webContents.openDevTools();      
      
      win.loadURL('http://localhost:3000');
    }
    win.maximize();
    mainWindow = win;
  }

  function setupIpcHandlers(store: ElectronStore) {
    console.log('Setting up IPC handlers');
    ipcMain.on('set-title', (event, title) => {
      if (mainWindow) {
        mainWindow.setTitle(title);
      }
    });

    ipcMain.on('load-page', (event, pathArg) => {
      console.log('loading page', pathArg);
      if (mainWindow) {
        if (isProd) {
          if (pathArg === '/') {
            pathArg = '/index';
          }
          mainWindow.loadURL(`file://${__dirname}/../next/${pathArg}.html`);
        } else {
          mainWindow.loadURL(`http://localhost:3000${pathArg}`);
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
    
    ipcMain.handle('open-message-dialog', (event, message, title, buttons, type) => {
      return dialog.showMessageBox({
        type,
        message,
        title,
        buttons
      });
    });

    ipcMain.handle('store-get-theme-preference', () => {
      console.log('Getting theme preference');
      return store.get('themePreference');
    });

    ipcMain.handle('store-set-theme-preference', (event, data) => {
      console.log('Setting theme preference to:', data);
      store.set('themePreference', data);
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
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          click: () => {
            if (isProd) {
              mainWindow?.loadURL(`file://${__dirname}/../next/settings.html`);
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
    createWindow();
    const store = await initStore();
    setupIpcHandlers(store);
    Menu.setApplicationMenu(menu);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    if (!isProd) {
      // Disable HTTP cache for development
      app.commandLine.appendSwitch('disable-http-cache');
    }
  });

