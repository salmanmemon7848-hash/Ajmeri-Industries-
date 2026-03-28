const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow;

// Data file path
const dataPath = path.join(app.getPath('userData'), 'data.json');

// Default data structure
const defaultData = {
  paddyPurchases: [],
  millingProcesses: [],
  expenses: [],
  workers: [],
  sales: [],
  stock: {
    paddy: { quantity: 0, unit: 'Qu', bags: 0 },
    rice: { quantity: 0, unit: 'Qu' },
    bran: { quantity: 0, unit: 'Qu' },
    broken: { quantity: 0, unit: 'Qu' },
    rafi: { quantity: 0, unit: 'Qu' },
    husk: { quantity: 0, unit: 'Qu' }
  }
};

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return { ...defaultData };
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

// Setup IPC handlers
function setupIpcHandlers() {
  // Get all data
  ipcMain.handle('get-data', () => {
    return loadData();
  });

  // Save all data
  ipcMain.handle('save-data', (event, data) => {
    return saveData(data);
  });

  // Reset data
  ipcMain.handle('reset-data', () => {
    return saveData({ ...defaultData });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    title: 'Ajmeri Industries Rice Mill',
    show: false
  });

  // Remove menu bar for cleaner look
  Menu.setApplicationMenu(null);

  // Load the built app
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // DevTools for debugging (enable if needed)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
