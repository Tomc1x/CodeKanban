const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listRoots: () => ipcRenderer.invoke('config:listRoots'),
  addRoot: () => ipcRenderer.invoke('config:addRoot'),
  removeRoot: (rootId) => ipcRenderer.invoke('config:removeRoot', rootId),

  listProjects: (rootId) => ipcRenderer.invoke('projects:list', rootId),

  readCards: (projectPath) => ipcRenderer.invoke('cards:read', projectPath),
  writeCard: (projectPath, card) => ipcRenderer.invoke('cards:write', projectPath, card),
  createCard: (projectPath, status) => ipcRenderer.invoke('cards:create', projectPath, status),
  deleteCard: (projectPath, cardId) => ipcRenderer.invoke('cards:delete', projectPath, cardId),
  reorderColumn: (projectPath, status, orderedIds) =>
    ipcRenderer.invoke('cards:reorderColumn', projectPath, status, orderedIds),

  watchProject: (projectPath) => ipcRenderer.invoke('watcher:watch', projectPath),
  unwatchProject: () => ipcRenderer.invoke('watcher:unwatch'),
  onCardsChanged: (callback) => {
    const listener = (_event, projectPath) => callback(projectPath);
    ipcRenderer.on('cards:changed', listener);
    return () => ipcRenderer.removeListener('cards:changed', listener);
  },

  copyToClipboard: (text) => ipcRenderer.invoke('clipboard:writeText', text),
});
