const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');
const { registerConfigHandlers } = require('./ipc/config.cjs');
const { registerProjectsHandlers } = require('./ipc/projects.cjs');
const { registerCardsHandlers } = require('./ipc/cards.cjs');
const { registerWatcherHandlers, stopAllWatchers } = require('./ipc/watcher.cjs');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  registerConfigHandlers(ipcMain);
  registerProjectsHandlers(ipcMain);
  registerCardsHandlers(ipcMain);
  registerWatcherHandlers(ipcMain, () => BrowserWindow.getAllWindows()[0] || null);

  ipcMain.handle('clipboard:writeText', (_event, text) => {
    clipboard.writeText(text);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }
});

app.on('window-all-closed', () => {
  stopAllWatchers();
  if (process.platform !== 'darwin') app.quit();
});
