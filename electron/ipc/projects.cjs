const fs = require('node:fs');
const path = require('node:path');
const { getStore } = require('./config.cjs');
const { readCardsFromDisk } = require('./cards.cjs');

function registerProjectsHandlers(ipcMain) {
  ipcMain.handle('projects:list', (_event, rootId) => {
    const root = getStore().get('roots').find((r) => r.id === rootId);
    if (!root) return [];

    if (!fs.existsSync(root.path)) return [];

    return fs
      .readdirSync(root.path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => {
        const projectPath = path.join(root.path, entry.name);
        const cards = readCardsFromDisk(projectPath);
        return {
          path: projectPath,
          name: entry.name,
          totalCount: cards.length,
          activeCount: cards.filter((c) => c.status !== 'validated' && c.status !== 'backlog').length,
          blockedCount: cards.filter((c) => c.status === 'blocked').length,
        };
      });
  });
}

module.exports = { registerProjectsHandlers };
