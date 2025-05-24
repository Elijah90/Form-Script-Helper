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
 * This prioritizes the dropdown selection if it exists, otherwise falls back to config
 * @return {string} The name of the data source sheet
 */
function getDataSourceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  
  // First, try to get the value from the dropdown (if it exists)
  if (dashSheet) {
    try {
      const dropdownValue = dashSheet.getRange("P2").getValue();
      if (dropdownValue && typeof dropdownValue === 'string' && dropdownValue.trim() !== '') {
        return dropdownValue;
      }
    } catch (e) {
      // Ignore errors if the cell doesn't exist yet
    }
  }
  
  // If dropdown doesn't exist or has no value, fall back to stored config
  return getDashboardConfig().dataSheet;
}

/**
 * Sets the data source sheet and updates the config
 * @param {string} sheetName - The name of the data sheet to use
 */
function setDataSourceSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = getOrCreateConfigSheet(ss);
  
  // Validate sheet name exists
  if (!ss.getSheetByName(sheetName)) {
    Logger.log(`Warning: Sheet "${sheetName}" not found`);
    return;
  }
  
  // Update the data source in the config sheet
  configSheet.getRange("B2").setValue(sheetName);
  
  // Also update the dropdown in the dashboard if it exists
  const dashSheet = ss.getSheetByName("DailyDash");
  if (dashSheet) {
    try {
      const dropdownCell = dashSheet.getRange("P2");
      dropdownCell.setValue(sheetName);
    } catch (e) {
      Logger.log("Could not update dropdown: " + e.message);
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
 * Adds dashboard control elements to specific positions:
 * - O1: Dashboard Settings label
 * - O2: Data Source label
 * - P2: Data source dropdown
 * 
 * This preserves any existing selection when refreshing.
 */
function addDashboardControls() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  if (!dashSheet) return;
  
  // First, check if dropdown already exists and has a value
  let currentSource = "";
  try {
    currentSource = dashSheet.getRange("P2").getValue();
  } catch (e) {
    // If cell doesn't exist, ignore error
  }
  
  // If dropdown doesn't have a value, use the config value
  if (!currentSource) {
    currentSource = getDashboardConfig().dataSheet;
  }
  
  // Clear any existing control areas
  dashSheet.getRange("O1:R3").clear();
  
  // Match the background color of the controls area with dashboard background
  dashSheet.getRange("O1:R3").setBackground("#f8f9fa");
  
  // Set up "Dashboard Settings" header
  dashSheet.getRange("O1").setValue("Dashboard Settings");
  dashSheet.getRange("O1").setFontWeight("bold");
  
  // Set up "Data Source:" label
  dashSheet.getRange("O2").setValue("Data Source:");
  
  // Set up dropdown with data validation
  const availableSheets = getAvailableDataSheets();
  if (availableSheets.length > 0) {
    const validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(availableSheets, true)
      .build();
      
    const dropdownCell = dashSheet.getRange("P2");
    dropdownCell.setValue(currentSource);
    dropdownCell.setDataValidation(validation);
    
    // Note in cell comment
    dropdownCell.setNote("Data source for dashboard. Changes take effect next refresh.");
  }
}

/**
 * Checks if the dashboard controls exist and are properly set up
 * @return {boolean} True if controls exist
 */
function dashboardControlsExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DailyDash");
  
  if (!dashSheet) return false;
  
  try {
    // Check if key elements exist
    const hasSettings = dashSheet.getRange("O1").getValue() === "Dashboard Settings";
    const hasDropdown = dashSheet.getRange("P2").getDataValidation() !== null;
    
    return hasSettings && hasDropdown;
  } catch (e) {
    return false;
  }
}