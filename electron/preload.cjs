const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listRoots: () => ipcRenderer.invoke('config:listRoots'),
  addRoot: () => ipcRenderer.invoke('config:addRoot'),
  removeRoot: (rootId) => ipcRenderer.invoke('config:removeRoot', rootId),
  getProjectSettings: (projectPath) => ipcRenderer.invoke('config:getProjectSettings', projectPath),
  setProjectSettings: (projectPath, settings) =>
    ipcRenderer.invoke('config:setProjectSettings', projectPath, settings),

  listProjects: (rootId) => ipcRenderer.invoke('projects:list', rootId),

  readCards: (projectPath) => ipcRenderer.invoke('cards:read', projectPath),
  writeCard: (projectPath, card) => ipcRenderer.invoke('cards:write', projectPath, card),
  createCard: (projectPath, status) => ipcRenderer.invoke('cards:create', projectPath, status),
  deleteCard: (projectPath, cardId) => ipcRenderer.invoke('cards:delete', projectPath, cardId),
  reorderColumn: (projectPath, status, orderedIds) =>
    ipcRenderer.invoke('cards:reorderColumn', projectPath, status, orderedIds),
  renameCard: (projectPath, filename, title) => ipcRenderer.invoke('cards:rename', projectPath, filename, title),
  archiveNow: (projectPath) => ipcRenderer.invoke('archive:now', projectPath),

  watchProject: (projectPath) => ipcRenderer.invoke('watcher:watch', projectPath),
  unwatchProject: () => ipcRenderer.invoke('watcher:unwatch'),
  onCardsChanged: (callback) => {
    const listener = (_event, projectPath) => callback(projectPath);
    ipcRenderer.on('cards:changed', listener);
    return () => ipcRenderer.removeListener('cards:changed', listener);
  },

  copyToClipboard: (text) => ipcRenderer.invoke('clipboard:writeText', text),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  getSkillContent: () => ipcRenderer.invoke('skill:getContent'),
  getSkillStatus: () => ipcRenderer.invoke('skill:getStatus'),
  installSkill: () => ipcRenderer.invoke('skill:install'),

  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeToggleWindow: () => ipcRenderer.invoke('window:maximizeToggle'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onWindowMaximizedChanged: (callback) => {
    const listener = (_event, isMaximized) => callback(isMaximized);
    ipcRenderer.on('window:maximizedChanged', listener);
    return () => ipcRenderer.removeListener('window:maximizedChanged', listener);
  },

  listAvailableSkills: () => ipcRenderer.invoke('skills:list'),

  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  restartAndInstallUpdate: () => ipcRenderer.invoke('updater:restartAndInstall'),
  onUpdaterStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('updater:status', listener);
    return () => ipcRenderer.removeListener('updater:status', listener);
  },
});
