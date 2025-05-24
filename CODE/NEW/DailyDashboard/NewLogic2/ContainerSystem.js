/**
 * Container System Module for CASAMANCE Dashboard
 * Provides utilities for creating consistent containers with white backgrounds
 */

/**
 * Creates a container with white background and border
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row for the container
 * @param {string[]} bandNames - Array of band names to span
 * @param {number} numRows - Number of rows for the container
 * @param {Object} options - Optional styling options
 * @return {Object} Container information including range and dimensions
 */
function createContainer(sheet, startRow, bandNames, numRows, options = {}) {
  // Get band information
  const bandInfo = getBands(bandNames);
  
  // Create the container range
  const containerRange = sheet.getRange(
    startRow, 
    bandInfo.startColumn, 
    numRows, 
    bandInfo.columnCount
  );
  
  // Apply default styling
  containerRange
    .setBackground(options.background || DASHBOARD_CONFIG.elementBackground)
    .setBorder(
      true, true, true, true, false, false,
      options.borderColor || DASHBOARD_CONFIG.tileBorder,
      SpreadsheetApp.BorderStyle.SOLID
    );
  
  // Apply additional styling if provided
  if (options.padding) {
    // Note: Google Sheets doesn't have padding, but we can simulate with row heights
    sheet.setRowHeight(startRow, 30); // Top padding
    sheet.setRowHeight(startRow + numRows - 1, 30); // Bottom padding
  }
  
  return {
    range: containerRange,
    startRow: startRow,
    endRow: startRow + numRows - 1,
    startColumn: bandInfo.startColumn,
    endColumn: bandInfo.startColumn + bandInfo.columnCount - 1,
    numRows: numRows,
    numColumns: bandInfo.columnCount,
    bands: bandInfo.bands,
    totalWidth: bandInfo.totalWidth
  };
}

/**
 * Creates a section container with a header
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row
 * @param {string[]} bandNames - Bands to span
 * @param {string} title - Section title
 * @param {number} contentRows - Number of rows for content (excluding header)
 * @return {Object} Section information
 */
function createSection(sheet, startRow, bandNames, title, contentRows) {
  // Total rows = 1 (header) + contentRows
  const totalRows = contentRows + 1;
  
  // Create the container
  const container = createContainer(sheet, startRow, bandNames, totalRows);
  
  // Format the header row
  const headerRange = sheet.getRange(
    startRow, 
    container.startColumn, 
    1, 
    container.numColumns
  );
  
  headerRange
    .merge()
    .setValue(title)
    .setFontFamily("Arial")
    .setFontSize(14)
    .setFontWeight("bold")
    .setFontColor(DASHBOARD_CONFIG.headerText)
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle")
    .setBackground("#f5f5f5"); // Slightly gray header background
  
  // Add internal border below header
  sheet.getRange(startRow + 1, container.startColumn, 1, container.numColumns)
    .setBorder(true, false, false, false, false, false, 
               DASHBOARD_CONFIG.tileBorder, 
               SpreadsheetApp.BorderStyle.SOLID);
  
  return {
    container: container,
    headerRow: startRow,
    contentStartRow: startRow + 1,
    contentEndRow: startRow + contentRows
  };
}

/**
 * Creates a spacing row between sections
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row to use for spacing
 * @param {number} height - Height of the spacing row (default: 15)
 */
function createSpacing(sheet, row, height = 15) {
  sheet.setRowHeight(row, height);
  // Ensure spacing row has dashboard background color
  sheet.getRange(row, 1, 1, sheet.getMaxColumns())
    .setBackground(DASHBOARD_CONFIG.backgroundColor)
    .setBorder(false, false, false, false, false, false);
}

/**
 * Test function for containers
 */
function testContainers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');
  
  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
  }
  
  // Set up grid
  setupGrid(sheet);
  
  // Set dashboard background
  sheet.getRange(1, 1, 50, DASHBOARD_GRID.bounds.endColumn)
    .setBackground(DASHBOARD_CONFIG.backgroundColor);
  
  // Hide gridlines for cleaner look
  sheet.setHiddenGridlines(true);
  
  // Add a title at the top
  sheet.getRange(1, 1, 1, 11)
    .merge()
    .setValue("Container System Test")
    .setFontSize(14)
    .setFontWeight("bold")
    .setFontColor(DASHBOARD_CONFIG.headerText)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 30);
  
  // Add spacing
  createSpacing(sheet, 2);
  createSpacing(sheet, 3);
  createSpacing(sheet, 4);
  
  // Test 1: Basic container (single KPI band)
  const container1 = createContainer(sheet, 5, ['kpi1'], 3);
  sheet.getRange(6, container1.startColumn)
    .setValue("Single Band Container")
    .setFontWeight("bold");
  sheet.getRange(7, container1.startColumn)
    .setValue(`Width: ${container1.totalWidth}px`)
    .setFontColor("#666666");
  
  // Add spacing
  createSpacing(sheet, 8);
  
  // Test 2: Multi-band container
  const container2 = createContainer(sheet, 9, ['kpi2', 'spacer2', 'kpi3'], 4);
  sheet.getRange(10, container2.startColumn)
    .setValue("Multi-band Container (2 KPIs + 1 spacer)")
    .setFontWeight("bold");
  sheet.getRange(11, container2.startColumn)
    .setValue(`Total width: ${container2.totalWidth}px`)
    .setFontColor("#666666");
  
  // Add spacing
  createSpacing(sheet, 13);
  
  // Test 3: Section with header
  const section = createSection(sheet, 14, ['kpi1', 'spacer1', 'kpi2'], "Section with Header", 3);
  sheet.getRange(section.contentStartRow, section.container.startColumn)
    .setValue("This is content inside a section container");
  sheet.getRange(section.contentStartRow + 1, section.container.startColumn)
    .setValue(`Section width: ${section.container.totalWidth}px`)
    .setFontColor("#666666");
  
  Logger.log("Container tests completed");
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Container tests completed! Check rows 5-20", 
    "Success", 
    3
  );
}