const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("sasquatchDesktop", {
  isDesktop: true
});
