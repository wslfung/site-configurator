import { app, BrowserWindow } from 'electron';
import serve from 'electron-serve';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'out' });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isProd) {
    win.loadURL('app://./index.html');
  } else {
    win.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {
  createWindow();

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
