const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

function listAvailableSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => {
      const entryPath = path.join(SKILLS_DIR, name);
      return fs.existsSync(entryPath) && fs.statSync(entryPath).isDirectory() && fs.existsSync(path.join(entryPath, 'SKILL.md'));
    })
    .sort();
}

function registerSkillsCatalogHandlers(ipcMain) {
  ipcMain.handle('skills:list', () => listAvailableSkills());
}

module.exports = { registerSkillsCatalogHandlers };
