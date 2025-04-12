"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_serve_1 = __importDefault(require("electron-serve"));
const path = __importStar(require("path"));
const isProd = process.env.NODE_ENV === 'production';
let mainWindow = null;
if (isProd) {
    (0, electron_serve_1.default)({ directory: 'out' });
}
electron_1.app.disableHardwareAcceleration();
function createWindow() {
    const win = new electron_1.BrowserWindow({
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
    }
    else {
        win.loadURL('http://localhost:3000');
    }
    mainWindow = win;
}
electron_1.app.whenReady().then(() => {
    createWindow();
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Settings',
                    click: () => {
                        if (isProd) {
                            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.loadURL('app://./settings');
                        }
                        else {
                            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.loadURL('http://localhost:3000/settings');
                        }
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }
    ]);
    electron_1.Menu.setApplicationMenu(menu);
    // Set up IPC handlers
    const setupIpcHandlers = () => {
        console.log('Setting up IPC handlers');
        electron_1.ipcMain.on('load-page', (event, path) => {
            console.log('Received close-settings event');
            if (mainWindow) {
                console.log('Navigating to home');
                console.log(event);
                console.log(path);
                if (isProd) {
                    mainWindow.loadURL(`app://./${path}`);
                }
                else {
                    mainWindow.loadURL(`http://localhost:3000${path}`);
                }
            }
            else {
                console.log('No main window found');
            }
        });
    };
    setupIpcHandlers();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
