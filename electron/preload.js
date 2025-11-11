// electron/preload.js
const { contextBridge } = require('electron');

// Expose an empty 'electron' object for now.
// This bridge can be used to securely expose Node.js APIs to the renderer process if needed in the future.
contextBridge.exposeInMainWorld('electron', {});

console.log('Preload script loaded.');