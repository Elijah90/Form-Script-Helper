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
 * Centralized Dashboard Grid/Band System
 * Defines all bands, columns, and widths for the dashboard layout
 */
const DASHBOARD_GRID = {
  bands: [
    { name: 'band1', columns: [1, 2, 3, 4], widths: [70, 70, 45, 45], color: '#E3F2FD' }, // A, B, C, D
    { name: 'spacer1', columns: [5], widths: [30], color: '#B3E5FC' }, // E
    { name: 'band2', columns: [6, 7, 8, 9], widths: [60, 60, 55, 55], color: '#FFF9C4' }, // F, G, H, I
    { name: 'spacer2', columns: [10], widths: [30], color: '#B3E5FC' }, // J
    { name: 'band3', columns: [11, 12, 13, 14], widths: [60, 60, 55, 55], color: '#E8F5E9' }, // K, L, M, N
    { name: 'spacer3', columns: [15], widths: [30], color: '#B3E5FC' }, // O
    { name: 'band4', columns: [16, 17, 18, 19], widths: [70, 70, 45, 45], color: '#FFEBEE' } // P, Q, R, S
  ],
  controls: { columns: [21, 22], widths: [175, 175], color: '#F3E5F5' } // U, V
};

/**
 * Sets up the dashboard grid: column widths and returns band mapping
 * @param {Sheet} sheet - The Google Sheet to format
 * @return {Object} Mapping of band names to column indices
 */
function setupDashboardGrid(sheet) {
  const bandMap = {};
  DASHBOARD_GRID.bands.forEach(band => {
    band.columns.forEach((col, idx) => {
      sheet.setColumnWidth(col, band.widths[idx]);
    });
    bandMap[band.name] = band.columns;
  });
  // Controls section
  DASHBOARD_GRID.controls.columns.forEach((col, idx) => {
    sheet.setColumnWidth(col, DASHBOARD_GRID.controls.widths[idx]);
  });
  bandMap['controls'] = DASHBOARD_GRID.controls.columns;
  return bandMap;
}

/**
 * Visualizes the grid by coloring each band differently for debugging or previewing real KPI tile colors
 * @param {Sheet} sheet - The Google Sheet to format
 * @param {number} startRow - The row to start coloring (default 1)
 * @param {number} numRows - Number of rows to color (default 10)
 * @param {boolean} useKpiColors - If true, use real KPI tile colors for bands (default false)
 */
function visualizeDashboardGrid(sheet, startRow = 1, numRows = 10, useKpiColors = false) {
  // 1. Set initial dashboard background color for all columns in the grid
  const allCols = [].concat(...DASHBOARD_GRID.bands.map(b => b.columns), DASHBOARD_GRID.controls.columns);
  allCols.forEach(col => {
    sheet.getRange(startRow, col, numRows, 1).setBackground(DASHBOARD_COLORS.background);
  });

  // 2. Overlay band and spacer colors
  const kpiTileColors = ['#E3F2FD', '#FFFDE7', '#E8F5E9', '#FFEBEE']; // Blue, Yellow, Green, Red (soft)
  let kpiColorIdx = 0;
  DASHBOARD_GRID.bands.forEach(band => {
    let color = band.color;
    if (useKpiColors && band.name.startsWith('band')) {
      color = kpiTileColors[kpiColorIdx % kpiTileColors.length];
      kpiColorIdx++;
    }
    band.columns.forEach(col => {
      sheet.getRange(startRow, col, numRows, 1).setBackground(color);
    });
  });
  // Controls section
  DASHBOARD_GRID.controls.columns.forEach(col => {
    sheet.getRange(startRow, col, numRows, 1).setBackground(DASHBOARD_GRID.controls.color);
  });
}

/**
 * Sets up the flexible dashboard column widths
 * @param {Sheet} sheet - The Google Sheet to format
 */
function setDashboardColumnWidths(sheet) {
  // Updated column widths for the new KPI tile structure
  // Total width per tile remains 230px (firstCellWidth + secondCellWidth)
  const firstCellWidth = 90;   // Reduced from 110px
  const secondCellWidth = 140; // Increased from 120px
  const spacerWidth = DASHBOARD_LAYOUT.spacerWidth; // 30px
  
  // Update DASHBOARD_LAYOUT constants for reference elsewhere
  DASHBOARD_LAYOUT.tileFirstCellWidth = firstCellWidth;
  DASHBOARD_LAYOUT.tileSecondCellWidth = secondCellWidth;
  
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
 * @return {Object} Object containing arrays for left and right columns of each KPI tile
 */
function getKpiTileColumns() {
  // Return an object with both left and right column positions for better structure
  return {
    left: [1, 4, 7, 10],  // Starting (left) columns for each tile
    right: [2, 5, 8, 11]   // Right columns for each tile (for value alignment)
  };
}

/**
 * Formats a range as a tile with white background and border
 * @param {Range} range - The range to format as a tile
 * @param {Object} options - Optional formatting options
 * @param {boolean} options.rightAlignSecondColumn - Whether to right-align the second column
 */
function formatTile(range, options = {}) {
  // Apply base tile formatting
  range.setBackground(DASHBOARD_COLORS.tileBackground)
       .setBorder(true, true, true, true, false, false, 
                 DASHBOARD_COLORS.tileBorder, 
                 SpreadsheetApp.BorderStyle.SOLID);
  
  // If this is a multi-column range and right alignment is requested for second column
  if (options.rightAlignSecondColumn && range.getNumColumns() > 1) {
    const sheet = range.getSheet();
    const startRow = range.getRow();
    const startCol = range.getColumn();
    const numRows = range.getNumRows();
    
    // Right-align the second column for better value display
    sheet.getRange(startRow, startCol + 1, numRows, 1).setHorizontalAlignment('right');
  }
}

/**
 * Sets standard row heights for KPI tiles
 * @param {Sheet} sheet - The Google Sheet to format
 * @param {number} startRow - The starting row for the KPI section
 */
function setKpiRowHeights(sheet, startRow) {
  sheet.setRowHeight(startRow, 25);     // Title row
  sheet.setRowHeight(startRow + 1, 50); // Main value row - taller for large text
  sheet.setRowHeight(startRow + 2, 25); // Change indicator row
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
/**
 * Formats a KPI tile title
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} row - The row for the title
 * @param {number} column - The starting column
 * @param {string} title - The title text
 */
function formatKpiTitle(sheet, row, column, title) {
  // Get the column structure to determine the right column
  const kpiColumns = getKpiTileColumns();
  const tileIndex = kpiColumns.left.indexOf(column);
  
  // If this is a known KPI column, use the structure
  if (tileIndex !== -1) {
    // Merge the title across both columns
    sheet.getRange(row, column, 1, 2)
         .merge()
         .setValue(title)
         .setFontSize(14)
         .setFontColor(DASHBOARD_COLORS.subText)
         .setVerticalAlignment("middle")
         .setHorizontalAlignment("left");
  } else {
    // Fallback for test cases or non-standard columns
    sheet.getRange(row, column, 1, 2)
         .merge()
         .setValue(title)
         .setFontSize(14)
         .setFontColor(DASHBOARD_COLORS.subText)
         .setVerticalAlignment("middle")
         .setHorizontalAlignment("left");
  }
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
  changeCell.clearContent().clearDataValidations().clearNote();
  try {
    changeCell.unmerge();
  } catch (e) {
    // Ignore if not merged or not possible
  }
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
 * Creates a container for a dashboard section using bands
 * NOTE: Does NOT merge the whole container range, only sets background and border.
 *       Merging of subranges (title, value, change indicator) should be handled by content functions.
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - The starting row for the container
 * @param {string[]} bandNames - Array of band/spacer names to span (e.g., ['band1'], ['band2','spacer2','band3'])
 * @param {number} numRows - Number of rows for the container
 * @param {Object} options - Formatting options: {background, border, title}
 * @return {Object} Info about the container: {range, startRow, endRow, startCol, endCol, columns}
 */
function createContainer(sheet, startRow, bandNames, numRows, options = {}) {
  // Get columns to span
  const allBands = DASHBOARD_GRID.bands;
  const columns = bandNames.flatMap(name => {
    const band = allBands.find(b => b.name === name);
    return band ? band.columns : [];
  });
  if (columns.length === 0) throw new Error('No columns found for bands: ' + bandNames.join(','));
  const startCol = Math.min(...columns);
  const endCol = Math.max(...columns);
  // Do NOT merge the container area (let content functions handle merging)
  const range = sheet.getRange(startRow, startCol, numRows, endCol - startCol + 1);
  // Set background and border
  if (options.background) range.setBackground(options.background);
  if (options.border) range.setBorder(true, true, true, true, false, false, DASHBOARD_COLORS.tileBorder, SpreadsheetApp.BorderStyle.SOLID);
  // Set title if provided (centered, but do not merge)
  if (options.title) {
    range.setValue(options.title)
         .setFontWeight('bold')
         .setFontSize(14)
         .setHorizontalAlignment('center')
         .setVerticalAlignment('middle');
  }
  return {
    range,
    startRow,
    endRow: startRow + numRows - 1,
    startCol,
    endCol,
    columns
  };
}

/**
 * Test function for the container system: creates sample containers
 */
function testContainerSystem() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DailyDash');
  setupDashboardGrid(sheet);
  // Clear a test area
  sheet.getRange(12, 1, 12, 16).clearContent().setBackground(DASHBOARD_COLORS.background);
  // Create a KPI tile container (band1)
  createContainer(sheet, 12, ['band1'], 3, {background: '#E3F2FD', border: true, title: 'KPI Tile 1'});
  // Create a table container spanning band2, spacer2, band3
  createContainer(sheet, 16, ['band2','spacer2','band3'], 4, {background: '#FFFDE7', border: true, title: 'Table Section'});
  // Create a full-width container (all bands and spacers)
  createContainer(sheet, 21, ['band1','spacer1','band2','spacer2','band3','spacer3','band4'], 2, {background: '#E8F5E9', border: true, title: 'Full Width Section'});
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
  
  // Create a sample KPI tile using the new 3-row structure
  formatTile(sheet.getRange(startRow, 1, 3, 2), { rightAlignSecondColumn: true });
  formatKpiTitle(sheet, startRow, 1, "Sample KPI");
  
  // Use the right column (column 2) for the value with right alignment
  sheet.getRange(startRow + 1, 2)
       .setValue(42)
       .setFontSize(36)
       .setFontWeight("bold")
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("right");
  
  // Use the right column for the change indicator
  sheet.getRange(startRow + 2, 2)
       .setValue("▲ 5%")
       .setFontSize(12)
       .setFontColor(DASHBOARD_COLORS.positive)
       .setHorizontalAlignment("right");
  
  // Test section container
  createSectionContainer(sheet, startRow + 6, 5, 1, 11, "Sample Section");
  
  Logger.log("Layout utilities test completed");
}

/**
 * Enforces the column widths for all bands and spacers in the dashboard grid.
 * Call this at the start of KPI and table rendering to ensure column widths are always correct.
 * @param {Sheet} sheet - The Google Sheet to format
 */
function enforceDashboardColumnWidths(sheet) {
  DASHBOARD_GRID.bands.forEach(band => {
    band.columns.forEach((col, idx) => {
      sheet.setColumnWidth(col, band.widths[idx]);
    });
  });
  if (DASHBOARD_GRID.controls && DASHBOARD_GRID.controls.columns) {
    DASHBOARD_GRID.controls.columns.forEach((col, idx) => {
      sheet.setColumnWidth(col, DASHBOARD_GRID.controls.widths[idx]);
    });
  }
}