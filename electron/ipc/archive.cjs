const fs = require('node:fs');
const path = require('node:path');
const { getStore } = require('./config.cjs');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Moves every card whose status is "validated" into `.taskboard/archive/<date>/`
 * once per calendar day, per project (tracked by project path in the config store).
 */
function maybeArchive(projectPath, cards) {
  const store = getStore();
  const archiveState = store.get('archiveState');
  const today = todayStr();
  if (archiveState[projectPath] === today) return false;

  const taskboardDir = path.join(projectPath, '.taskboard');
  const archiveDir = path.join(taskboardDir, 'archive', today);
  const toArchive = cards.filter((c) => c.status === 'validated');

  if (toArchive.length > 0) {
    fs.mkdirSync(archiveDir, { recursive: true });
    for (const card of toArchive) {
      const from = path.join(taskboardDir, card.filename);
      const to = path.join(archiveDir, card.filename);
      if (fs.existsSync(from)) fs.renameSync(from, to);
    }
  }

  store.set('archiveState', { ...archiveState, [projectPath]: today });
  return toArchive.length > 0;
}

module.exports = { maybeArchive };
