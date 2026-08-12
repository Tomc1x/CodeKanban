const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseCardFile, serializeCard, nowIso } = require('../lib/cardFile.cjs');
const { assertKnownProjectPath } = require('../lib/safePath.cjs');
const { maybeArchive } = require('./archive.cjs');

function taskboardDir(projectPath) {
  return path.join(projectPath, '.taskboard');
}

function readCardsFromDisk(projectPath) {
  const dir = taskboardDir(projectPath);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const raw = fs.readFileSync(path.join(dir, entry.name), 'utf-8');
      return parseCardFile(raw, entry.name);
    })
    .sort((a, b) => a.order - b.order);
}

function writeCardToDisk(projectPath, card) {
  const dir = taskboardDir(projectPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, card.filename), serializeCard(card), 'utf-8');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'nouvelle-tache';
}

function nextSeq(dir) {
  if (!fs.existsSync(dir)) return 1;
  const nums = fs
    .readdirSync(dir)
    .map((f) => f.match(/^(\d+)-/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

function registerCardsHandlers(ipcMain) {
  ipcMain.handle('cards:read', (_event, projectPath) => {
    const safePath = assertKnownProjectPath(projectPath);
    let cards = readCardsFromDisk(safePath);
    const archived = maybeArchive(safePath, cards);
    if (archived) cards = readCardsFromDisk(safePath);
    return cards;
  });

  ipcMain.handle('cards:write', (_event, projectPath, card) => {
    const safePath = assertKnownProjectPath(projectPath);
    if (card.status === 'validated' && !card.validatedAt) {
      card.validatedAt = nowIso();
    }
    writeCardToDisk(safePath, card);
    return true;
  });

  ipcMain.handle('cards:create', (_event, projectPath, status) => {
    const safePath = assertKnownProjectPath(projectPath);
    const dir = taskboardDir(safePath);
    const seq = nextSeq(dir);
    const id = String(seq).padStart(3, '0');
    const title = 'Nouvelle tâche';
    const filename = `${id}-${slugify(title)}.md`;
    const card = {
      id,
      status: status || 'backlog',
      priority: 'moyenne',
      estimate: '',
      order: seq * 10,
      wi: null,
      skills: [],
      created: nowIso(),
      updated: nowIso(),
      validatedAt: null,
      filename,
      title,
      description: '',
      checklist: [],
      comments: [],
    };
    writeCardToDisk(safePath, card);
    return card;
  });

  ipcMain.handle('cards:delete', (_event, projectPath, filename) => {
    const safePath = assertKnownProjectPath(projectPath);
    const file = path.join(taskboardDir(safePath), filename);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return true;
  });

  ipcMain.handle('cards:reorderColumn', (_event, projectPath, status, orderedFilenames) => {
    const safePath = assertKnownProjectPath(projectPath);
    const cards = readCardsFromDisk(safePath);
    orderedFilenames.forEach((filename, index) => {
      const card = cards.find((c) => c.filename === filename);
      if (card) {
        card.status = status;
        card.order = (index + 1) * 10;
        card.updated = nowIso();
        writeCardToDisk(safePath, card);
      }
    });
    return true;
  });
}

module.exports = { registerCardsHandlers, readCardsFromDisk, taskboardDir };
