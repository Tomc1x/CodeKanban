const chokidar = require('chokidar');
const { assertKnownProjectPath } = require('../lib/safePath.cjs');
const { taskboardDir } = require('./cards.cjs');

let activeWatcher = null;
let activeProjectPath = null;

function registerWatcherHandlers(ipcMain, getWindow) {
  ipcMain.handle('watcher:watch', (_event, projectPath) => {
    const safePath = assertKnownProjectPath(projectPath);
    if (activeWatcher && activeProjectPath === safePath) return true;
    stopAllWatchers();

    activeProjectPath = safePath;
    activeWatcher = chokidar.watch(taskboardDir(safePath), {
      ignoreInitial: true,
      depth: 0,
    });

    const notify = () => {
      const win = getWindow();
      if (win) win.webContents.send('cards:changed', safePath);
    };

    activeWatcher.on('add', notify).on('change', notify).on('unlink', notify);
    return true;
  });

  ipcMain.handle('watcher:unwatch', () => {
    stopAllWatchers();
    return true;
  });
}

function stopAllWatchers() {
  if (activeWatcher) {
    activeWatcher.close();
    activeWatcher = null;
    activeProjectPath = null;
  }
}

module.exports = { registerWatcherHandlers, stopAllWatchers };
