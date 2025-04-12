import { app, BrowserWindow, Menu, ipcMain } from 'electron';
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
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  if (isProd) {
    win.loadURL('app://./index.html');
  } else {
    win.loadURL('http://localhost:3000');
  }
  mainWindow = win;
}

app.whenReady().then(() => {
  createWindow();

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

  Menu.setApplicationMenu(menu);


  // Set up IPC handlers
  const setupIpcHandlers = () => {
    console.log('Setting up IPC handlers');
    ipcMain.on('load-page', (event, path) => {
      console.log('Received close-settings event');
      if (mainWindow) {
        console.log('Navigating to home');
        console.log(event);
        console.log(path);
        if (isProd) {
          mainWindow.loadURL(`app://./${path}`);
        } else {
          mainWindow.loadURL(`http://localhost:3000${path}`);
        }
      } else {
        console.log('No main window found');
      }
    });
  };

  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
