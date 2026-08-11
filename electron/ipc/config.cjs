const { dialog, BrowserWindow } = require('electron');
const path = require('node:path');
const crypto = require('node:crypto');
const Store = require('electron-store');

const store = new Store({
  name: 'codekanban-config',
  defaults: { roots: [], archiveState: {} },
});

function getStore() {
  return store;
}

function registerConfigHandlers(ipcMain) {
  ipcMain.handle('config:listRoots', () => store.get('roots'));

  ipcMain.handle('config:addRoot', async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) return store.get('roots');

    const rootPath = result.filePaths[0];
    const roots = store.get('roots');
    if (roots.some((r) => r.path === rootPath)) return roots;

    const newRoot = { id: crypto.randomUUID(), path: rootPath, name: path.basename(rootPath) };
    const updated = [...roots, newRoot];
    store.set('roots', updated);
    return updated;
  });

  ipcMain.handle('config:removeRoot', (_event, rootId) => {
    const updated = store.get('roots').filter((r) => r.id !== rootId);
    store.set('roots', updated);
    return updated;
  });
}

module.exports = { registerConfigHandlers, getStore };
