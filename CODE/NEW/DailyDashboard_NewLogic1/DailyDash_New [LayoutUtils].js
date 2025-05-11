/**
 * Layout Utilities Module for CASAMANCE Dashboard
 * 
 * This module contains functions for formatting and layout
 * to ensure consistent styling across all dashboard components.
 */

/**
 * Dashboard color constants
 */
const DASHBOARD_COLORS = {
  background: "#f8f9fa",
  tileBackground: "white",
  tileBorder: "#dddddd",
  headerText: "#333333",
  subText: "#666666",
  positive: "#4CAF50",    // Green
  warning: "#FFEB3B",     // Yellow
  negative: "#F44336",    // Red
  neutral: "#2196F3",      // Blue
  neutralChange: "#FF9800" // Orange for neutral change
};

/**
 * Dashboard layout constants
 */
const DASHBOARD_LAYOUT = {
  tileMaxWidth: 230,           // Max width for KPI tiles
  tileFirstCellPercent: 0.38,  // 38% of tile width
  tileSecondCellPercent: 0.62, // 62% of tile width
  spacerWidth: 30,             // Width between tiles
  
  // Use the original working widths instead of calculated values
  tileFirstCellWidth: 110,     // Original working width
  tileSecondCellWidth: 120     // Original working width
};

/**
 * Sets up the flexible dashboard column widths
 * @param {Sheet} sheet - The Google Sheet to format
 */
function setDashboardColumnWidths(sheet) {
  // Use the original working widths that were proven to work
  const firstCellWidth = DASHBOARD_LAYOUT.tileFirstCellWidth;   // 110px (original)
  const secondCellWidth = DASHBOARD_LAYOUT.tileSecondCellWidth; // 120px (original)
  const spacerWidth = DASHBOARD_LAYOUT.spacerWidth;            // 30px
  
  // Set column widths for KPI tiles with consistent spacing
  sheet.setColumnWidth(1, firstCellWidth);   // A - KPI 1 first cell
  sheet.setColumnWidth(2, secondCellWidth);  // B - KPI 1 second cell
  sheet.setColumnWidth(3, spacerWidth);      // C - Spacer
  sheet.setColumnWidth(4, firstCellWidth);   // D - KPI 2 first cell
  sheet.setColumnWidth(5, secondCellWidth);  // E - KPI 2 second cell
  sheet.setColumnWidth(6, spacerWidth);      // F - Spacer
  sheet.setColumnWidth(7, firstCellWidth);   // G - KPI 3 first cell
  sheet.setColumnWidth(8, secondCellWidth);  // H - KPI 3 second cell
  sheet.setColumnWidth(9, spacerWidth);      // I - Spacer
  sheet.setColumnWidth(10, firstCellWidth);  // J - KPI 4 first cell
  sheet.setColumnWidth(11, secondCellWidth); // K - KPI 4 second cell
  
  // Other columns for later sections
  sheet.setColumnWidth(15, 175); // O - Dashboard controls
  sheet.setColumnWidth(16, 175); // P - Dashboard controls
}

/**
 * Gets the column positions for KPI tiles based on flexible layout
 * @return {Array} Array of starting columns for each KPI tile
 */
function getKpiTileColumns() {
  return [1, 4, 7, 10]; // Starting columns for each tile
}

/**
 * Formats a range as a tile with white background and border
 * @param {Range} range - The range to format as a tile
 */
function formatTile(range) {
  range.setBackground(DASHBOARD_COLORS.tileBackground)
       .setBorder(true, true, true, true, false, false, 
                 DASHBOARD_COLORS.tileBorder, 
                 SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Sets standard row heights for KPI tiles
 * @param {Sheet} sheet - The Google Sheet to format
 * @param {number} startRow - The starting row for the KPI section
 */
function setKpiRowHeights(sheet, startRow) {
  sheet.setRowHeight(startRow, 25);     // Title row
  sheet.setRowHeight(startRow + 1, 50); // Main value row - taller for large text
  sheet.setRowHeight(startRow + 2, 25); // Change indicator/subtitle row
}

/**
 * Sets standard row heights for section headers
 * @param {Sheet} sheet - The Google Sheet to format
 * @param {number} headerRow - The row containing the section header
 */
function setSectionHeaderRowHeight(sheet, headerRow) {
  sheet.setRowHeight(headerRow, 30);
}

/**
 * Formats a section header with proper styling
 * @param {Range} headerRange - The range containing the section header
 * @param {string} title - The title text for the section
 */
function formatSectionHeader(headerRange, title) {
  headerRange.setValue(title)
             .setFontSize(16)
             .setFontWeight("bold")
             .setFontColor(DASHBOARD_COLORS.headerText)
             .setVerticalAlignment("middle");
}

/**
 * Creates a title for a KPI tile
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the title
 * @param {number} column - The column for the title
 * @param {string} title - The title text
 */
function formatKpiTitle(sheet, row, column, title) {
  // Merge both cells for the title
  sheet.getRange(row, column, 1, 2)
       .merge()
       .setValue(title)
       .setFontSize(14)
       .setFontColor(DASHBOARD_COLORS.subText)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left");
}

/**
 * Formats the main value of a KPI tile
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the value
 * @param {number} column - The column for the value
 * @param {any} value - The value to display
 */
function formatKpiValue(sheet, row, column, value) {
  // Clear any previous content and formatting
  sheet.getRange(row, column).clear();
  
  // Format the cell with the main value
  sheet.getRange(row, column)
       .setValue(value)
       .setFontSize(36)
       .setFontWeight("bold")
       .setFontColor(DASHBOARD_COLORS.headerText)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left");
}

/**
 * Formats a subtitle for a KPI tile
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the subtitle
 * @param {number} column - The column for the subtitle
 * @param {string} subtitle - The subtitle text
 */
function formatKpiSubtitle(sheet, row, column, subtitle) {
  // Merge both cells for the subtitle
  sheet.getRange(row, column, 1, 2)
       .merge()
       .setValue(subtitle)
       .setFontSize(12)
       .setFontColor(DASHBOARD_COLORS.subText)
       .setVerticalAlignment("top")
       .setHorizontalAlignment("left");
}

/**
 * Creates a yellow highlight bar for the Average Rating KPI
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the highlight bar
 * @param {number} column - The column for the highlight bar
 */
function createYellowHighlightBar(sheet, row, column) {
  // Highlight both cells in the main value row
  sheet.getRange(row, column, 1, 2)
       .setBackground(DASHBOARD_COLORS.warning);
}

/**
 * Formats a table header row
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the header
 * @param {number} startCol - The starting column
 * @param {number} numCols - The number of columns
 * @param {string[]} headers - Array of header texts
 */
function formatTableHeader(sheet, row, startCol, numCols, headers) {
  // Set background for entire header row
  sheet.getRange(row, startCol, 1, numCols)
       .setBackground("#f1f3f4")
       .setBorder(true, true, true, true, false, false);
  
  // Set each header text
  for (let i = 0; i < headers.length; i++) {
    sheet.getRange(row, startCol + i)
         .setValue(headers[i])
         .setFontSize(12)
         .setFontWeight("bold")
         .setFontColor(DASHBOARD_COLORS.headerText)
         .setVerticalAlignment("middle");
  }
}

/**
 * Formats a table data row
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the data
 * @param {number} startCol - The starting column
 * @param {number} numCols - The number of columns
 * @param {any[]} values - Array of values for the row
 * @param {string} backgroundColor - Background color for the row
 */
function formatTableDataRow(sheet, row, startCol, numCols, values, backgroundColor) {
  // Set background for entire row
  sheet.getRange(row, startCol, 1, numCols)
       .setBackground(backgroundColor)
       .setBorder(true, true, true, true, false, false);
  
  // Set each cell value
  for (let i = 0; i < values.length; i++) {
    sheet.getRange(row, startCol + i)
         .setValue(values[i])
         .setFontSize(12)
         .setFontColor(DASHBOARD_COLORS.headerText)
         .setVerticalAlignment("middle");
  }
}

/**
 * Creates a status pill (colored button-like indicator)
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the status
 * @param {number} column - The column for the status
 * @param {string} status - The status text
 * @param {string} statusType - The type of status ('new', 'inProgress', 'resolved', etc.)
 */
function createStatusPill(sheet, row, column, status, statusType) {
  let backgroundColor;
  
  switch (statusType.toLowerCase()) {
    case 'new':
      backgroundColor = DASHBOARD_COLORS.negative;
      break;
    case 'inprogress':
      backgroundColor = DASHBOARD_COLORS.warning;
      break;
    case 'resolved':
      backgroundColor = DASHBOARD_COLORS.positive;
      break;
    default:
      backgroundColor = DASHBOARD_COLORS.neutral;
  }
  
  sheet.getRange(row, column)
       .setValue(status.toUpperCase())
       .setFontSize(10)
       .setFontColor("white")
       .setBackground(backgroundColor)
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle");
}

/**
 * Creates a progress bar for milestone tracking
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the progress bar
 * @param {number} column - The column for the progress bar
 * @param {number} current - The current value
 * @param {number} target - The target value
 * @param {string} text - The text to display on the progress bar
 * @param {string} colorLevel - The color level ('good', 'medium', 'poor')
 */
function createProgressBar(sheet, row, column, current, target, text, colorLevel) {
  // Create an empty cell for the progress bar
  const progressCell = sheet.getRange(row, column);
  
  // Determine color based on level
  let color;
  switch (colorLevel.toLowerCase()) {
    case 'good':
      color = DASHBOARD_COLORS.positive;
      break;
    case 'medium':
      color = DASHBOARD_COLORS.warning;
      break;
    case 'poor':
      color = DASHBOARD_COLORS.negative;
      break;
    default:
      color = DASHBOARD_COLORS.neutral;
  }
  
  // Use a custom formula to create a visual progress bar
  const percent = Math.min(1, current / target);
  
  // Use a drawing or a background color to represent progress
  progressCell.setBackground(DASHBOARD_COLORS.background);
  
  // Create a partial colored cell using a trick with merged cells
  if (percent > 0) {
    const tempRange = sheet.getRange(row, column, 1, 1);
    tempRange.setBackground(color);
  }
  
  // Add text overlay
  progressCell.setValue(text)
              .setHorizontalAlignment("center")
              .setVerticalAlignment("middle")
              .setFontColor("white")
              .setFontWeight("bold");
}

/**
 * Adds spacing after a section
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row after which to add spacing
 */
function addSectionSpacing(sheet, row) {
  sheet.setRowHeight(row, 15);
}

/**
 * Clears and prepares a section area
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - The starting row of the section
 * @param {number} numRows - The number of rows in the section
 * @param {number} numCols - The number of columns in the section
 */
function clearSectionArea(sheet, startRow, numRows, numCols) {
  const range = sheet.getRange(startRow, 1, numRows, numCols);
  range.clear();
  range.setBackground(DASHBOARD_COLORS.background);
  range.setBorder(false, false, false, false, false, false);
}

/**
 * Creates a container for a dashboard section
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - The starting row of the section
 * @param {number} numRows - The number of rows for the container
 * @param {number} startCol - The starting column
 * @param {number} numCols - The number of columns
 * @param {string} title - The section title
 * @return {object} - An object with section information
 */
function createSectionContainer(sheet, startRow, numRows, startCol, numCols, title) {
  // Clear the area
  clearSectionArea(sheet, startRow, numRows, Math.max(numCols, 15));
  
  // Create container with white background and border
  const containerRange = sheet.getRange(startRow, startCol, numRows, numCols);
  containerRange
    .setBackground(DASHBOARD_COLORS.tileBackground)
    .setBorder(true, true, true, true, false, false, 
              DASHBOARD_COLORS.tileBorder, 
              SpreadsheetApp.BorderStyle.SOLID);
  
  // Add section title
  formatSectionHeader(sheet.getRange(startRow, startCol), title);
  
  // Return section info for further use
  return {
    startRow: startRow,
    contentStartRow: startRow + 1, // Row after the header
    endRow: startRow + numRows - 1,
    startCol: startCol,
    endCol: startCol + numCols - 1
  };
}

/**
 * Formats a KPI value with change indicator using flexible layout
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the main value
 * @param {number} column - The column for the main value
 * @param {any} value - The main KPI value
 * @param {number} change - The change value
 * @param {boolean} reverseColors - Whether to reverse the color logic
 * @param {string} tileTitle - The title of the tile
 * @param {string} tileSubtitle - The subtitle of the tile
 */
function formatKpiValueWithChange(sheet, row, column, value, change, reverseColors = false, tileTitle = "", tileSubtitle = "") {
  // Main value in the first cell of the current row (valueRow)
  const mainValueCell = sheet.getRange(row, column);
  mainValueCell.clearContent().clearDataValidations().clearNote(); // Explicitly clear
  mainValueCell.setValue(value)
       .setFontSize(36)
       .setFontWeight("bold")
       .setFontColor(DASHBOARD_COLORS.headerText)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left")
       .setNumberFormat("@");

  // Adjacent cell in the value row for secondary info
  const secondaryInfoCell = sheet.getRange(row, column + 1);
  secondaryInfoCell.clearContent().clearDataValidations().clearNote(); // Explicitly clear

  // Handle specific content for Average Rating and 5-Star Ratings
  if (tileTitle === "Average Rating") {
    secondaryInfoCell.setValue("(out of 5.0)")
         .setFontSize(12)
         .setFontColor(DASHBOARD_COLORS.subText)
         .setVerticalAlignment("middle") // Changed from bottom
         .setHorizontalAlignment("left");
  } else if (tileTitle === "5-Star Ratings") {
    secondaryInfoCell.setValue(tileSubtitle) // tileSubtitle is "X% of total"
         .setFontSize(12)
         .setFontColor(DASHBOARD_COLORS.subText)
         .setVerticalAlignment("middle") // Changed from bottom
         .setHorizontalAlignment("left");
  } else {
    // Ensure it's blank for other tiles
    secondaryInfoCell.clearContent();
  }

  // Change indicator row (valueRow + 1, which is startRow + 2)
  const changeIndicatorRow = row + 1;
  const changeCell = sheet.getRange(changeIndicatorRow, column, 1, 2);
  // Clear, unmerge, then merge to ensure clean state
  changeCell.clearContent().clearDataValidations().clearNote().unmerge(); 
  changeCell.merge();

  // Create the change indicator text
  let changeText = "";
  let changeColor = DASHBOARD_COLORS.subText;

  if (change > 0) {
    changeText = "▲ " + Math.abs(change);
    changeColor = reverseColors ? DASHBOARD_COLORS.negative : DASHBOARD_COLORS.positive;
  } else if (change < 0) {
    changeText = "▼ " + Math.abs(change);
    changeColor = reverseColors ? DASHBOARD_COLORS.positive : DASHBOARD_COLORS.negative;
  } else {
    changeText = "— 0"; 
    changeColor = DASHBOARD_COLORS.neutralChange;
  }
  
  const fullChangeText = changeText + " vs. yesterday";

  try {
    const richText = SpreadsheetApp.newRichTextValue()
                                  .setText(fullChangeText)
                                  .setTextStyle(0, changeText.length, SpreadsheetApp.newTextStyle()
                                                                      .setForegroundColor(changeColor)
                                                                      .build())
                                  .setTextStyle(changeText.length, fullChangeText.length, 
                                               SpreadsheetApp.newTextStyle()
                                                             .setForegroundColor(DASHBOARD_COLORS.subText)
                                                             .build())
                                  .build();
    changeCell.setRichTextValue(richText);
  } catch (e) {
    changeCell.setValue(fullChangeText).setFontColor(changeColor);
    Logger.log("Rich text failed for change indicator: " + e.toString());
  }
  
  changeCell.setFontSize(12)
            .setVerticalAlignment("middle")
            .setHorizontalAlignment("left");

  if (tileTitle === "% Negative Cases") {
    changeCell.setNote(tileSubtitle); 
  } else {
    // Ensure no note for other tiles on this cell unless specifically set
    changeCell.clearNote();
  }
}

/**
 * Test function to verify layout utilities
 */
function testLayoutUtils() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  // Test column widths
  setDashboardColumnWidths(sheet);
  
  // Test KPI formatting
  const startRow = 4;
  setKpiRowHeights(sheet, startRow);
  
  // Create a sample KPI tile
  formatTile(sheet.getRange(startRow, 1, 5, 2));
  formatKpiTitle(sheet, startRow, 1, "Sample KPI");
  formatKpiValueWithChange(sheet, startRow + 1, 1, 42, 5);
  formatKpiSubtitle(sheet, startRow + 3, 1, "Sample subtitle");
  
  // Test section container
  createSectionContainer(sheet, startRow + 6, 5, 1, 11, "Sample Section");
  
  Logger.log("Layout utilities test completed");
}