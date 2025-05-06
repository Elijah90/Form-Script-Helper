/**
 * Dashboard Configuration Module
 * 
 * This module provides centralized configuration for the dashboard,
 * including data source selection and other global settings.
 */

// Default configuration settings
const DEFAULT_CONFIG = {
  dataSheet: "Form Responses 1",  // Default data source sheet
  refreshInterval: 60,            // Auto-refresh interval in minutes (if implemented)
  showTrends: true,               // Whether to show trend indicators
  colorScheme: "default"          // Color scheme (for future theming options)
};

/**
 * Loads the current dashboard configuration
 * @return {Object} The configuration object
 */
function getDashboardConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = getOrCreateConfigSheet(ss);
  
  // Load configuration from sheet
  const config = {...DEFAULT_CONFIG}; // Start with defaults
  
  // Read current data source setting
  const dataSourceCell = configSheet.getRange("B2");
  const dataSource = dataSourceCell.getValue();
  if (dataSource) {
    config.dataSheet = dataSource;
  }
  
  // Read other configuration settings as needed
  // (can be expanded as more settings are added)
  
  return config;
}

/**
 * Gets the current data source sheet name
 * @return {string} The name of the data source sheet
 */
function getDataSourceSheet() {
  return getDashboardConfig().dataSheet;
}

/**
 * Sets the data source sheet and updates the config
 * @param {string} sheetName - The name of the data sheet to use
 */
function setDataSourceSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = getOrCreateConfigSheet(ss);
  
  // Update the data source in the config sheet
  configSheet.getRange("B2").setValue(sheetName);
  
  // Show a confirmation
  ss.toast(`Data source changed to "${sheetName}"`, "Configuration Updated", 3);
}

/**
 * Creates or gets the configuration sheet
 * @param {Spreadsheet} ss - The active spreadsheet
 * @return {Sheet} The configuration sheet
 */
function getOrCreateConfigSheet(ss) {
  // Try to get the config sheet
  let configSheet = ss.getSheetByName("DashConfig");
  
  // If it doesn't exist, create it
  if (!configSheet) {
    configSheet = ss.insertSheet("DashConfig");
    initializeConfigSheet(configSheet);
    // Hide the config sheet (optional)
    configSheet.hideSheet();
  }
  
  return configSheet;
}

/**
 * Sets up the initial configuration sheet
 * @param {Sheet} sheet - The configuration sheet
 */
function initializeConfigSheet(sheet) {
  // Set up headers
  sheet.getRange("A1:B1").setValues([["Setting", "Value"]]);
  sheet.getRange("A1:B1").setFontWeight("bold");
  
  // Set up data source setting
  sheet.getRange("A2").setValue("Data Source");
  sheet.getRange("B2").setValue(DEFAULT_CONFIG.dataSheet);
  
  // Add data validation for data source
  const availableSheets = getAvailableDataSheets();
  
  if (availableSheets.length > 0) {
    const validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(availableSheets, true)
      .build();
    sheet.getRange("B2").setDataValidation(validation);
  }
  
  // Add other configuration settings here as needed
  
  // Format the sheet
  sheet.autoResizeColumns(1, 2);
}

/**
 * Gets a list of available sheets that could be used as data sources
 * @return {string[]} Array of sheet names
 */
function getAvailableDataSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  // Filter out dashboard sheets
  return sheets
    .map(sheet => sheet.getName())
    .filter(name => 
      name !== "DailyDash" && 
      name !== "DashConfig" &&
      !name.includes("Dashboard"));
}

/**
 * Creates a data source selector dropdown directly in the dashboard
 * @param {Sheet} dashSheet - The dashboard sheet
 * @param {number} row - The row to place the selector
 * @param {number} col - The column to place the selector
 */
function createDataSourceSelector(dashSheet, row, col) {
  // Set up label
  dashSheet.getRange(row, col).setValue("Data Source:");
  dashSheet.getRange(row, col).setFontWeight("bold");
  
  // Set up dropdown
  const availableSheets = getAvailableDataSheets();
  const currentSource = getDataSourceSheet();
  
  // Create data validation for dropdown
  if (availableSheets.length > 0) {
    const validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(availableSheets, true)
      .build();
      
    const dropdownCell = dashSheet.getRange(row, col + 1);
    dropdownCell.setValue(currentSource);
    dropdownCell.setDataValidation(validation);
    
    // Add a note to explain
    dropdownCell.setNote("Select the sheet containing form response data.\nChanging this will update dashboard data on next refresh.");
  }
}

/**
 * Function to handle changes to the data source dropdown
 * This can be triggered by an edit event or button click
 */
function onDataSourceChange() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  
  // Assuming the dropdown is at a specific location
  // Update this to match where you place the dropdown
  const dropdownValue = dashSheet.getRange("B11").getValue();
  
  if (dropdownValue && dropdownValue !== getDataSourceSheet()) {
    setDataSourceSheet(dropdownValue);
    
    // Trigger a dashboard refresh
    if (typeof refreshDashboard === 'function') {
      refreshDashboard();
    }
  }
}

/**
 * Adds configuration controls to the dashboard
 * @param {number} startRow - The row to start the controls section
 * @return {number} - The next row after the controls section
 */
function addDashboardControls(startRow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  
  // Create a section for dashboard controls
  dashSheet.getRange(startRow, 1, 1, 3).merge();
  dashSheet.getRange(startRow, 1).setValue("Dashboard Settings");
  dashSheet.getRange(startRow, 1).setFontWeight("bold");
  
  // Add data source selector
  createDataSourceSelector(dashSheet, startRow + 1, 1);
  
  // Add other controls as needed
  
  // Add a refresh button using a drawing or a cell with a note
  dashSheet.getRange(startRow + 1, 4).setValue("Refresh Dashboard");
  dashSheet.getRange(startRow + 1, 4)
    .setFontColor("blue")
    .setFontWeight("bold")
    .setNote("Click this cell and run the 'refreshDashboard' function to update the dashboard");
  
  // Add some spacing
  dashSheet.setRowHeight(startRow + 3, 15);
  
  return startRow + 4;
}

/**
 * Installs an onEdit trigger to detect changes to the data source dropdown
 * Call this once to set up the trigger
 */
function installDataSourceChangeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onEditTrigger')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
}

/**
 * Handles edit events in the spreadsheet
 * @param {Object} e - The edit event object
 */
function onEditTrigger(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Check if the edit was in the data source dropdown
  if (sheet.getName() === "DailyDash" && 
      range.getRow() === 11 && 
      range.getColumn() === 2) {
    onDataSourceChange();
  }
}

/**
 * Test function for the configuration module
 */
function testConfigModule() {
  const config = getDashboardConfig();
  Logger.log("Current configuration:");
  Logger.log(JSON.stringify(config));
  
  const availableSheets = getAvailableDataSheets();
  Logger.log("Available data sheets:");
  Logger.log(availableSheets);
  
  // Test adding controls to the dashboard
  const dashSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DailyDash");
  if (dashSheet) {
    const nextRow = addDashboardControls(10);
    Logger.log("Added controls to dashboard, next row: " + nextRow);
  }
}