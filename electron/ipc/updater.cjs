const { autoUpdater } = require('electron-updater');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;

/**
 * A build predating the .deb detection below may have already downloaded and
 * left behind a pending update package here; clear it so a stale record can
 * never trigger an unwanted privileged install on quit.
 */
function clearStalePendingUpdate() {
  const pendingDir = path.join(os.homedir(), '.cache', 'codekanban-updater', 'pending');
  fs.rmSync(pendingDir, { recursive: true, force: true });
}

function registerUpdaterHandlers(ipcMain, getWindow) {
  const send = (status) => {
    const win = getWindow();
    win?.webContents.send('updater:status', status);
  };

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = supportsAutoUpdate();
  // Range-request-based delta downloads occasionally get refused by GitHub's
  // CDN over HTTP/2 (ERR_HTTP2_SERVER_REFUSED_STREAM) — plain full downloads
  // are slower but far more reliable.
  autoUpdater.disableDifferentialDownload = true;

  if (!supportsAutoUpdate()) clearStalePendingUpdate();

  autoUpdater.on('checking-for-update', () => send({ state: 'checking' }));
  autoUpdater.on('update-available', (info) => send({ state: 'available', version: info.version }));
  autoUpdater.on('update-not-available', () => send({ state: 'not-available' }));
  autoUpdater.on('download-progress', (progress) => send({ state: 'downloading', percent: Math.round(progress.percent) }));
  autoUpdater.on('update-downloaded', (info) => send({ state: 'downloaded', version: info.version }));
  autoUpdater.on('error', (err) => send({ state: 'error', message: err?.message || String(err) }));

  ipcMain.handle('updater:check', () => {
    if (!supportsAutoUpdate()) {
      send({ state: 'unsupported' });
      return;
    }
    autoUpdater.checkForUpdates().catch((err) => send({ state: 'error', message: err?.message || String(err) }));
  });

  ipcMain.handle('updater:restartAndInstall', () => {
    autoUpdater.quitAndInstall();
  });
}

/**
 * electron-updater only supports NSIS (Windows) and AppImage (Linux) — a .deb
 * install has no AppImage to patch, so skip auto-update entirely instead of
 * surfacing checkForUpdates() failures the user can't act on.
 */
function supportsAutoUpdate() {
  if (process.platform === 'win32') return true;
  if (process.platform === 'linux') return Boolean(process.env.APPIMAGE);
  return false;
}

function startUpdaterChecks() {
  if (!supportsAutoUpdate()) return;
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, CHECK_INTERVAL_MS);
}

module.exports = { registerUpdaterHandlers, startUpdaterChecks, supportsAutoUpdate };
