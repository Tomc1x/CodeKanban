const fs = require('node:fs');
const path = require('node:path');
const { getStore } = require('./config.cjs');
const { readCardsFromDisk } = require('./cards.cjs');

function toSummary(projectPath, name) {
  const cards = readCardsFromDisk(projectPath);
  return {
    path: projectPath,
    name,
    totalCount: cards.length,
    activeCount: cards.filter((c) => c.status !== 'validated' && c.status !== 'backlog').length,
    blockedCount: cards.filter((c) => c.status === 'blocked').length,
  };
}

function registerProjectsHandlers(ipcMain) {
  ipcMain.handle('projects:list', (_event, rootId) => {
    const root = getStore().get('roots').find((r) => r.id === rootId);
    if (!root) return [];

    if (!fs.existsSync(root.path)) return [];

    return fs
      .readdirSync(root.path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => toSummary(path.join(root.path, entry.name), entry.name));
  });

  ipcMain.handle('projects:create', (_event, rootId, name) => {
    const root = getStore().get('roots').find((r) => r.id === rootId);
    if (!root) throw new Error('Dossier racine introuvable.');

    const trimmed = String(name || '').trim();
    if (!trimmed || trimmed === '.' || trimmed === '..' || /[\\/]/.test(trimmed)) {
      throw new Error('Nom de projet invalide.');
    }

    const projectPath = path.join(root.path, trimmed);
    // mkdirSync({ recursive: true }) is a no-op if the folder already exists — reopening an
    // existing project (with or without .taskboard/) never overwrites its content.
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, '.taskboard'), { recursive: true });

    return toSummary(projectPath, trimmed);
  });
}

module.exports = { registerProjectsHandlers };
