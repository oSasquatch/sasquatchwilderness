const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

const APP_URL = "https://sasquatch.fq7xrtdkqs.workers.dev/";
const PLAYER_WIDTH = 640;
const PLAYER_HEIGHT = 360;
const PLAYER_EDGE_COMPENSATION_X = 12;
const PLAYER_EDGE_COMPENSATION_Y = 12;
const PLAYER_X = -PLAYER_EDGE_COMPENSATION_X;
const PLAYER_Y = -PLAYER_EDGE_COMPENSATION_Y;

let mainWindow;
let playerWindow;

// Use a fixed userData path and reduce shader cache churn on Windows.
app.setPath("userData", path.join(app.getPath("appData"), "SasquatchWildernessDesktop"));
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

function wirePlayerCloseShortcuts(win) {
  win.webContents.on("before-input-event", (event, input) => {
    const key = String(input.key || "").toLowerCase();
    const ctrlOrCmd = Boolean(input.control || input.meta);
    const shift = Boolean(input.shift);

    if (key === "escape") {
      event.preventDefault();
      win.close();
      return;
    }

    if (ctrlOrCmd && key === "w") {
      event.preventDefault();
      win.close();
      return;
    }

    if (ctrlOrCmd && shift && key === "w") {
      event.preventDefault();
      win.close();
    }
  });
}

function injectInvisibleCloseHotspot(win) {
  const script = `
    (() => {
      const existing = document.getElementById('__sasq_close_hotspot');
      if (existing) {
        return;
      }

      const zone = document.createElement('div');
      zone.id = '__sasq_close_zone';
      zone.style.position = 'fixed';
      zone.style.top = '0';
      zone.style.right = '0';
      zone.style.width = '56px';
      zone.style.height = '56px';
      zone.style.zIndex = '2147483647';
      zone.style.display = 'flex';
      zone.style.alignItems = 'flex-start';
      zone.style.justifyContent = 'flex-end';

      const hotspot = document.createElement('button');
      hotspot.id = '__sasq_close_hotspot';
      hotspot.type = 'button';
      hotspot.setAttribute('aria-label', 'Close player window');
      hotspot.textContent = '×';

      hotspot.style.position = 'fixed';
      hotspot.style.top = '0';
      hotspot.style.right = '0';
      hotspot.style.width = '32px';
      hotspot.style.height = '32px';
      hotspot.style.border = '0';
      hotspot.style.margin = '0';
      hotspot.style.padding = '0';
      hotspot.style.background = 'rgba(0,0,0,0)';
      hotspot.style.color = 'rgba(255,255,255,0)';
      hotspot.style.cursor = 'pointer';
      hotspot.style.outline = 'none';
      hotspot.style.fontSize = '22px';
      hotspot.style.lineHeight = '1';
      hotspot.style.borderBottomLeftRadius = '8px';
      hotspot.style.transition = 'background-color 120ms ease, color 120ms ease';

      const showHotspot = () => {
        hotspot.style.background = 'rgba(20,20,20,0.78)';
        hotspot.style.color = 'rgba(255,255,255,0.95)';
      };

      const hideHotspot = () => {
        hotspot.style.background = 'rgba(0,0,0,0)';
        hotspot.style.color = 'rgba(255,255,255,0)';
      };

      zone.addEventListener('mouseenter', showHotspot);
      zone.addEventListener('mouseleave', hideHotspot);
      hotspot.addEventListener('focus', showHotspot);
      hotspot.addEventListener('blur', hideHotspot);

      hotspot.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.close();
      });

      zone.appendChild(hotspot);
      document.documentElement.appendChild(zone);
    })();
  `;

  win.webContents.executeJavaScript(script, true).catch(() => {
    // Some pages can reject script execution during navigation; retry on next load.
  });
}

function createPlayerWindow(targetUrl) {
  if (!playerWindow || playerWindow.isDestroyed()) {
    playerWindow = new BrowserWindow({
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      x: PLAYER_X,
      y: PLAYER_Y,
      useContentSize: true,
      frame: false,
      thickFrame: false,
      roundedCorners: false,
      hasShadow: false,
      movable: true,
      resizable: false,
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

    playerWindow.on("closed", () => {
      playerWindow = null;
    });

    wirePlayerCloseShortcuts(playerWindow);
    playerWindow.webContents.on("did-finish-load", () => {
      injectInvisibleCloseHotspot(playerWindow);
    });
  }

  playerWindow.setBounds({
    x: PLAYER_X,
    y: PLAYER_Y,
    width: PLAYER_WIDTH + PLAYER_EDGE_COMPENSATION_X,
    height: PLAYER_HEIGHT + PLAYER_EDGE_COMPENSATION_Y
  });
  playerWindow.loadURL(targetUrl);
  playerWindow.show();
  playerWindow.focus();
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

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  app.on("second-instance", () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });

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
