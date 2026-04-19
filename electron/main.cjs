const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

const APP_URL = "https://sasquatch.fq7xrtdkqs.workers.dev/";
const PLAYER_WIDTH = 760;
const PLAYER_HEIGHT = 430;

let mainWindow;

function createPlayerWindow(targetUrl) {
  const playerWindow = new BrowserWindow({
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    x: 0,
    y: 0,
    frame: false,
    movable: true,
    resizable: true,
    alwaysOnTop: true,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    backgroundColor: "#000000",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  playerWindow.loadURL(targetUrl);
  return playerWindow;
}

function wireWindowOpenHandling(win) {
  win.webContents.setWindowOpenHandler(({ url, frameName }) => {
    if (frameName === "sasquatchOnePieceViewer") {
      createPlayerWindow(url);
      return { action: "deny" };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    autoHideMenuBar: true,
    backgroundColor: "#101513",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  wireWindowOpenHandling(mainWindow);
  mainWindow.loadURL(APP_URL);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
