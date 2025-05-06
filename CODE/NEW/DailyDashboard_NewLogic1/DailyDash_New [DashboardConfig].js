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
  
  // Also update the dropdown in the dashboard if it exists
  const dashSheet = ss.getSheetByName("DailyDash");
  if (dashSheet) {
    try {
      dashSheet.getRange("B11").setValue(sheetName);
    } catch (e) {
      // Ignore error if the cell doesn't exist yet
    }
  }
  
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
    // Hide the config sheet
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
 * Adds dashboard control elements to specific positions as requested
 * This is called during dashboard refresh
 */
function addDashboardControls() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  if (!dashSheet) return;
  
  // Get the current data source
  const currentSource = getDataSourceSheet();
  
  // Clear any existing control areas
  dashSheet.getRange("A10:E12").clear();
  
  // Set up "Dashboard Settings" header
  dashSheet.getRange("A10").setValue("Dashboard Settings");
  dashSheet.getRange("A10").setFontWeight("bold");
  
  // Set up "Data Source:" label
  dashSheet.getRange("A11").setValue("Data Source:");
  
  // Set up dropdown with data validation
  const availableSheets = getAvailableDataSheets();
  if (availableSheets.length > 0) {
    const validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(availableSheets, true)
      .build();
      
    const dropdownCell = dashSheet.getRange("B11");
    dropdownCell.setValue(currentSource);
    dropdownCell.setDataValidation(validation);
    dropdownCell.setNote("Select the sheet containing form response data");
  }
  
  // Set up refresh button
  dashSheet.getRange("D11").setValue("Refresh Dashboard");
  dashSheet.getRange("D11").setFontColor("blue");
  dashSheet.getRange("D11").setFontWeight("bold");
  dashSheet.getRange("D11").setNote("Click this cell and press Ctrl+Enter to refresh");
  
  // Add a small spacing
  dashSheet.setRowHeight(12, 15);
}

/**
 * Function to handle changes to the data source dropdown
 * This can be triggered by an edit event
 */
function onDataSourceChange() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  
  // Get the dropdown value
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
  addDashboardControls();
  Logger.log("Added dashboard controls");
}