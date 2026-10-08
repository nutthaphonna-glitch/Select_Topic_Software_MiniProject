const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: '1.0.0',
  saveDownloadedFile: (filename, buffer) => ipcRenderer.invoke('save-file', { filename, buffer })
});
