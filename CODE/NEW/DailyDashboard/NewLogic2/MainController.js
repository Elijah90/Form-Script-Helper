/**
 * Main Controller for CASAMANCE Dashboard
 * Coordinates the creation of all dashboard components
 */

/**
 * Main function to build the dashboard
 * @param {boolean} dataMode - If true, populate with real data; if false, use sample data
 */
function buildDashboard(dataMode = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');
  
  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
  }
  
  Logger.log("Starting dashboard build...");
  
  try {
    // Step 1: Set up the grid system
    setupGrid(sheet);
    
    // Step 2: Set dashboard background
    const maxRows = 50;
    const maxCols = DASHBOARD_GRID.bounds.endColumn;
    sheet.getRange(1, 1, maxRows, maxCols).setBackground(DASHBOARD_CONFIG.backgroundColor);
    
    // Hide gridlines for cleaner look
    sheet.setHiddenGridlines(true);
    
    // Step 3: Create header
    let currentRow = createHeader(sheet, 1);
    Logger.log(`Header complete. Current row: ${currentRow}`);
    
    // Step 4: Create KPI tiles
    currentRow = createKPITiles(sheet, currentRow, dataMode);
    
    // Step 5: Create tables (to be implemented)
    // currentRow = createTables(sheet, currentRow, dataMode);
    
    // Success message
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Dashboard built successfully!", 
      "Success", 
      3
    );
    
  } catch (error) {
    Logger.log(`Error building dashboard: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Error: ${error.message}`, 
      "Build Failed", 
      5
    );
  }
}

/**
 * Menu creation for easy access
 */
function onOpen(e) {
  let ui;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (err) {
    Logger.log('UI not available, skipping menu creation: ' + err);
    return;
  }
  ui.createMenu('CASAMANCE Dashboard')
    .addItem('Build Dashboard (Sample Data)', 'buildDashboardWithSampleData')
    .addItem('Build Dashboard (Real Data)', 'buildDashboardWithRealData')
    .addSeparator()
    .addSubMenu(ui.createMenu('Test Components')
      .addItem('Test Grid Setup', 'testGridSetup')
      .addItem('Test Header Only', 'testHeader')
      .addItem('Test Containers', 'testContainers')
      .addItem('Test KPIs Only', 'testKPIsOnly')
      .addItem('Visualize Grid', 'visualizeGridTest'))
    .addSeparator()
    .addItem('Clear Dashboard', 'clearDashboard')
    .addToUi();
}

/**
 * Wrapper functions for menu items
 */
function buildDashboardWithSampleData() {
  buildDashboard(false);
}

function buildDashboardWithRealData() {
  buildDashboard(true);
}

/**
 * Clears the dashboard
 */
function clearDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Clear Dashboard',
      'Are you sure you want to clear the entire dashboard?',
      ui.ButtonSet.YES_NO
    );
    
    if (response == ui.Button.YES) {
      sheet.clear();
      sheet.setHiddenGridlines(false);  // Show gridlines again
      SpreadsheetApp.getActiveSpreadsheet().toast("Dashboard cleared", "Success", 2);
    }
  }
}

/**
 * Test function to visualize the grid
 */
function visualizeGridTest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');
  
  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
  }
  
  setupGrid(sheet);
  sheet.setHiddenGridlines(true);
  visualizeGrid(sheet, 10, 5);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Grid visualization created at row 10 with legend", 
    "Visualization Complete", 
    3
  );
}

/**
 * Test function to create only KPI tiles
 */
function testKPIsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');

  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
  }

  // Ensure grid is set up as createKPITiles depends on it
  setupGrid(sheet);
  sheet.setHiddenGridlines(true);

  // Start KPI tiles after a few rows, e.g., row 6
  createKPITiles(sheet, 6, false); // Use sample data for testing

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "KPI tiles created",
    "Test Complete",
    3
  );
}