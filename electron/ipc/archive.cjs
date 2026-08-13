const fs = require('node:fs');
const path = require('node:path');
const { getStore } = require('./config.cjs');

const DAY_MS = 24 * 60 * 60 * 1000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getArchiveFrequency(projectPath) {
  const settings = getStore().get('projectSettings')[projectPath];
  return settings?.archiveFrequency || 'daily';
}

function daysSince(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / DAY_MS;
}

function moveValidatedToArchive(projectPath, cards, today) {
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

  return toArchive.length > 0;
}

/**
 * Moves every card whose status is "validated" into `.taskboard/archive/<date>/`, according to
 * the project's `archiveFrequency` setting ('daily' | 'weekly' | 'never'). Tracked per project
 * path in the config store's `archiveState` (last archive date).
 */
function maybeArchive(projectPath, cards) {
  const frequency = getArchiveFrequency(projectPath);
  if (frequency === 'never') return false;

  const store = getStore();
  const archiveState = store.get('archiveState');
  const lastArchived = archiveState[projectPath];
  const today = todayStr();

  if (frequency === 'daily' && lastArchived === today) return false;
  if (frequency === 'weekly' && lastArchived && daysSince(lastArchived) < 7) return false;

  const didArchive = moveValidatedToArchive(projectPath, cards, today);
  store.set('archiveState', { ...archiveState, [projectPath]: today });
  return didArchive;
}

/** Archives every "validated" card immediately, regardless of `archiveFrequency`. */
function archiveNow(projectPath, cards) {
  const store = getStore();
  const archiveState = store.get('archiveState');
  const today = todayStr();

  const didArchive = moveValidatedToArchive(projectPath, cards, today);
  store.set('archiveState', { ...archiveState, [projectPath]: today });
  return didArchive;
}

module.exports = { maybeArchive, archiveNow };
