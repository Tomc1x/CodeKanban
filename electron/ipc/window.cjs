function registerWindowHandlers(ipcMain, getWindow) {
  ipcMain.handle('window:minimize', () => {
    getWindow()?.minimize();
  });

  ipcMain.handle('window:maximizeToggle', () => {
    const win = getWindow();
    if (!win) return false;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    return win.isMaximized();
  });

  ipcMain.handle('window:close', () => {
    getWindow()?.close();
  });

  ipcMain.handle('window:isMaximized', () => getWindow()?.isMaximized() ?? false);
}

function watchMaximizeState(win) {
  const send = () => win.webContents.send('window:maximizedChanged', win.isMaximized());
  win.on('maximize', send);
  win.on('unmaximize', send);
}

module.exports = { registerWindowHandlers, watchMaximizeState };
