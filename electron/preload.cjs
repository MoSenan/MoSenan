const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('pf', { platform: process.platform, version: '0.1.0' });
