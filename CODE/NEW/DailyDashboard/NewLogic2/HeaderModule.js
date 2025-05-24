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
    clearArea(sheet, startRow, 3, headerBands.startColumn, headerBands.columnCount);
    
    // Create the main title
    createTitle(sheet, startRow, headerBands);
    
    // Create the date/time subtitle
    createDateSubtitle(sheet, startRow + 1, headerBands);
    
    // Add spacing row
    sheet.setRowHeight(startRow + 2, 15);
    
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
      .setFontColor("#333333")
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
      .setFontColor("#666666")
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
    
    // Set dashboard background
    sheet.getRange(1, 1, 50, 20).setBackground(DASHBOARD_CONFIG.backgroundColor);
    
    // Create the header
    const nextRow = createHeader(sheet);
    
    Logger.log(`Header created. Next available row: ${nextRow}`);
    
    // Add a visual indicator for the next section
    sheet.getRange(nextRow, 1).setValue("← Next section starts here");
  }