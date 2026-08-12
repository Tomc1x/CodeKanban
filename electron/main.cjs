const { app, BrowserWindow, ipcMain, clipboard, Menu } = require('electron');
const path = require('node:path');
const { registerConfigHandlers } = require('./ipc/config.cjs');
const { registerProjectsHandlers } = require('./ipc/projects.cjs');
const { registerCardsHandlers } = require('./ipc/cards.cjs');
const { registerWatcherHandlers, stopAllWatchers } = require('./ipc/watcher.cjs');
const { registerSkillHandlers } = require('./ipc/skill.cjs');
const { registerWindowHandlers, watchMaximizeState } = require('./ipc/window.cjs');
const { registerSkillsCatalogHandlers } = require('./ipc/skills-catalog.cjs');
const { registerUpdaterHandlers, startUpdaterChecks } = require('./ipc/updater.cjs');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  watchMaximizeState(win);

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  return win;
}

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  registerConfigHandlers(ipcMain);
  registerProjectsHandlers(ipcMain);
  registerCardsHandlers(ipcMain);
  registerWatcherHandlers(ipcMain, () => BrowserWindow.getAllWindows()[0] || null);
  registerSkillHandlers(ipcMain);
  registerWindowHandlers(ipcMain, () => BrowserWindow.getAllWindows()[0] || null);
  registerSkillsCatalogHandlers(ipcMain);
  registerUpdaterHandlers(ipcMain, () => BrowserWindow.getAllWindows()[0] || null);

  ipcMain.handle('clipboard:writeText', (_event, text) => {
    clipboard.writeText(text);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (!isDev) {
    startUpdaterChecks();
  }
});

app.on('window-all-closed', () => {
  stopAllWatchers();
  if (process.platform !== 'darwin') app.quit();
});
