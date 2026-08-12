const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SOURCE_SKILL_PATH = path.join(__dirname, '..', '..', 'skill', 'codekanban', 'SKILL.md');
const TARGET_DIR = path.join(os.homedir(), '.claude', 'skills', 'codekanban');
const TARGET_PATH = path.join(TARGET_DIR, 'SKILL.md');

function readSource() {
  return fs.readFileSync(SOURCE_SKILL_PATH, 'utf8');
}

function getStatus() {
  const source = readSource();
  if (!fs.existsSync(TARGET_PATH)) return { installed: false, upToDate: false, path: TARGET_PATH };

  const target = fs.readFileSync(TARGET_PATH, 'utf8');
  return { installed: true, upToDate: target === source, path: TARGET_PATH };
}

function registerSkillHandlers(ipcMain) {
  ipcMain.handle('skill:getContent', () => readSource());
  ipcMain.handle('skill:getStatus', () => getStatus());

  ipcMain.handle('skill:install', () => {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    fs.writeFileSync(TARGET_PATH, readSource(), 'utf8');
    return getStatus();
  });
}

module.exports = { registerSkillHandlers };
