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
  neutral: "#2196F3"      // Blue
};

/**
 * Sets up the standard dashboard column widths for proper layout
 * @param {Sheet} sheet - The Google Sheet to format
 */
function setDashboardColumnWidths(sheet) {
  // Set column widths for KPI tiles with proper width distribution and spacing
  sheet.setColumnWidth(1, 110); // A - Main value column
  sheet.setColumnWidth(2, 120);  // B - Change indicator column
  sheet.setColumnWidth(3, 30);  // C - Spacer between tiles
  sheet.setColumnWidth(4, 110); // D - Main value column
  sheet.setColumnWidth(5, 120);  // E - Change indicator column
  sheet.setColumnWidth(6, 30);  // F - Spacer between tiles
  sheet.setColumnWidth(7, 110); // G - Main value column
  sheet.setColumnWidth(8,120);  // H - Change indicator column
  sheet.setColumnWidth(9, 30);  // I - Spacer between tiles
  sheet.setColumnWidth(10, 110); // J - Main value column
  sheet.setColumnWidth(11, 120);  // K - Change indicator column
  
  // Other columns for later sections
  sheet.setColumnWidth(15, 175); // O - Dashboard controls
  sheet.setColumnWidth(16, 175); // P - Dashboard controls
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
  sheet.setRowHeight(startRow + 3, 25); // Additional info row
  sheet.setRowHeight(startRow + 4, 20); // Color bar row (for Average Rating)
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
  sheet.getRange(row, column)
       .setValue(title)
       .setFontSize(14)
       .setFontColor(DASHBOARD_COLORS.subText)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left");  // Left-align titles
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
       .setHorizontalAlignment("left");  // Left-align values
}

/**
 * Formats a subtitle for a KPI tile
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the subtitle
 * @param {number} column - The column for the subtitle
 * @param {string} subtitle - The subtitle text
 */
function formatKpiSubtitle(sheet, row, column, subtitle) {
  sheet.getRange(row, column)
       .setValue(subtitle)
       .setFontSize(12)
       .setFontColor(DASHBOARD_COLORS.subText)
       .setVerticalAlignment("top")
       .setHorizontalAlignment("left");  // Left-align subtitles
}

/**
 * Creates a yellow highlight bar for the Average Rating KPI
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the highlight bar
 * @param {number} column - The column for the highlight bar
 */
function createYellowHighlightBar(sheet, row, column) {
  // Move highlight to row 5 (main value row instead of row + 4)
  // This puts the highlight where the main figure is
  sheet.getRange(row, column, 1, 2)
       .setBackground(DASHBOARD_COLORS.warning); // Yellow highlight
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
 * Formats a KPI value with change indicator on the same row
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the main value
 * @param {number} column - The column for the main value
 * @param {any} value - The main KPI value
 * @param {number} change - The change value
 * @param {boolean} reverseColors - Whether to reverse the color logic
 */
/**
 * Formats a KPI value with change indicator
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the main value
 * @param {number} column - The column for the main value
 * @param {any} value - The main KPI value
 * @param {number} change - The change value
 * @param {boolean} reverseColors - Whether to reverse the color logic
 */
function formatKpiValueWithChange(sheet, row, column, value, change, reverseColors = false) {
  // Format the main value in the first column
  sheet.getRange(row, column)
       .setValue(value)
       .setFontSize(36)
       .setFontWeight("bold")
       .setFontColor(DASHBOARD_COLORS.headerText)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left")
       // Add number formatting to prevent percentage issues
       .setNumberFormat("@"); // Display as plain text
  
  // Always show change indicator, even if change is 0
  let changeText = "";
  let changeColor = DASHBOARD_COLORS.subText;
  
  if (change > 0) {
    changeText = "▲ " + Math.abs(change);
    changeColor = reverseColors ? DASHBOARD_COLORS.negative : DASHBOARD_COLORS.positive;
  } else if (change < 0) {
    changeText = "▼ " + Math.abs(change);
    changeColor = reverseColors ? DASHBOARD_COLORS.positive : DASHBOARD_COLORS.negative;
  } else {
    // When change is exactly 0, show a neutral indicator
    changeText = "◆ 0";
    changeColor = DASHBOARD_COLORS.neutral;
  }
  
  // Add the change indicator in the column to the right
  sheet.getRange(row, column + 1)
       .setValue(changeText)
       .setFontSize(14)
       .setFontColor(changeColor)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left");
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
  formatTile(sheet.getRange(startRow, 1, 5, 1));
  formatKpiTitle(sheet, startRow, 1, "Sample KPI");
  formatKpiValueWithChange(sheet, startRow + 1, 1, 42, 5);
  formatKpiSubtitle(sheet, startRow + 3, 1, "Sample subtitle");
  
  // Test section container
  createSectionContainer(sheet, startRow + 6, 5, 1, 7, "Sample Section");
  
  Logger.log("Layout utilities test completed");
}