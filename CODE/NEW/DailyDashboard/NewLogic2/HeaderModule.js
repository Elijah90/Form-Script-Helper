/**
 * Header Module for CASAMANCE Dashboard
 * Creates the header section with title and date/time
 */

/**
 * Creates the dashboard header
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row for the header (default: 1)
 * @return {number} The next available row after the header
 */
function createHeader(sheet, startRow = 1) {
  Logger.log("Creating dashboard header...");
  
  // Get the bands we'll use for the header (span across first 4 KPI bands)
  const headerBands = getBands(['kpi1', 'spacer1', 'kpi2', 'spacer2', 'kpi3', 'spacer3', 'kpi4']);
  
  // Clear the header area
  clearArea(sheet, startRow, 2, headerBands.startColumn, headerBands.columnCount);
  
  // Create header container with white background and border
  const headerContainer = sheet.getRange(startRow, headerBands.startColumn, 2, headerBands.columnCount);
  headerContainer
    .setBackground(DASHBOARD_CONFIG.elementBackground)
    .setBorder(true, true, true, true, false, false, 
               DASHBOARD_CONFIG.tileBorder, 
               SpreadsheetApp.BorderStyle.SOLID);
  
  // Create the main title
  createTitle(sheet, startRow, headerBands);
  
  // Create the date/time subtitle
  createDateSubtitle(sheet, startRow + 1, headerBands);
  
  // Add spacing row (dashboard background color)
  sheet.setRowHeight(startRow + 2, 15);
  sheet.getRange(startRow + 2, 1, 1, sheet.getMaxColumns())
    .setBackground(DASHBOARD_CONFIG.backgroundColor);
  
  // Return the next available row
  return startRow + 3;
}

/**
 * Creates the main dashboard title
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - Row for the title
 * @param {Object} bands - Band information
 */
function createTitle(sheet, row, bands) {
  // Set row height
  sheet.setRowHeight(row, 40);
  
  // Merge cells for the title
  const titleRange = sheet.getRange(row, bands.startColumn, 1, bands.columnCount);
  titleRange.merge();
  
  // Set the title text
  titleRange.setValue("CASAMANCE Daily Performance Dashboard");
  
  // Apply formatting
  titleRange
    .setFontFamily("Arial")
    .setFontSize(20)
    .setFontWeight("bold")
    .setFontColor(DASHBOARD_CONFIG.headerText)
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");
}

/**
 * Creates the date/time subtitle
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - Row for the subtitle
 * @param {Object} bands - Band information
 */
function createDateSubtitle(sheet, row, bands) {
  // Set row height
  sheet.setRowHeight(row, 25);
  
  // Merge cells for the subtitle
  const subtitleRange = sheet.getRange(row, bands.startColumn, 1, bands.columnCount);
  subtitleRange.merge();
  
  // Get current date and time
  const now = new Date();
  const timezone = Session.getScriptTimeZone();
  const dateStr = Utilities.formatDate(now, timezone, "MMMM d, yyyy");
  const timeStr = Utilities.formatDate(now, timezone, "HH:mm");
  
  // Set the subtitle text
  subtitleRange.setValue(`Date: ${dateStr} • Last updated: ${timeStr}`);
  
  // Apply formatting
  subtitleRange
    .setFontFamily("Arial")
    .setFontSize(12)
    .setFontColor(DASHBOARD_CONFIG.subText)
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");
}

/**
 * Clears an area of the sheet
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row
 * @param {number} numRows - Number of rows to clear
 * @param {number} startCol - Starting column
 * @param {number} numCols - Number of columns to clear
 */
function clearArea(sheet, startRow, numRows, startCol, numCols) {
  const range = sheet.getRange(startRow, startCol, numRows, numCols);
  range.clear();
  range.setBackground(DASHBOARD_CONFIG.backgroundColor);
  range.setBorder(false, false, false, false, false, false);
}

/**
 * Test function for the header
 */
function testHeader() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');
  
  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
  }
  
  // Set up the grid first
  setupGrid(sheet);
  
  // Set dashboard background for entire visible area
  sheet.getRange(1, 1, 50, DASHBOARD_GRID.bounds.endColumn)
    .setBackground(DASHBOARD_CONFIG.backgroundColor);
  
  // Hide gridlines for cleaner look
  sheet.setHiddenGridlines(true);
  
  // Create the header
  const nextRow = createHeader(sheet);
  
  Logger.log(`Header created. Next available row: ${nextRow}`);
  
  // Add a visual indicator for the next section
  const indicatorBands = getBands(['kpi1']);
  sheet.getRange(nextRow, indicatorBands.startColumn)
    .setValue("↓ Next section starts here")
    .setFontColor("#999999")
    .setFontStyle("italic");
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Header created successfully!", 
    "Success", 
    3
  );
}