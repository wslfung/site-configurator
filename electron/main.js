"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_serve_1 = require("electron-serve");
var isProd = process.env.NODE_ENV === 'production';
if (isProd) {
    (0, electron_serve_1.default)({ directory: 'out' });
}
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    if (isProd) {
        win.loadURL('app://./index.html');
    }
    else {
        win.loadURL('http://localhost:3000');
    }
}
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
