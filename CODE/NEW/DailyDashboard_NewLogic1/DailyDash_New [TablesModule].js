/**
 * Tables Module for Representative Performance
 * 
 * This module creates and formats the Representative Performance table
 * in the CASAMANCE Daily Dashboard using the flexible grid system
 */

/**
 * Creates the Representative Performance table
 * @param {number} startRow - The row to start creating the table
 * @return {number} - The next row after the table
 */
function createRepPerformanceTable(startRow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  Logger.log("Creating Representative Performance table");
  
  try {
    // Add spacing after KPI tiles (3 rows for visual separation)
    const tableStartRow = startRow + 2;
    
    // Get data source sheet
    const dataSource = getDataSourceSheet();
    
    // Get representative performance data
    const repData = getRepPerformanceData(dataSource);
    
    // Create table that spans the same width as KPI tiles (columns A to K)
    const numRows = Math.max(repData.length + 3, 8); // Header + data rows + padding
    
    // Clear and set up the table area
    clearSectionArea(sheet, tableStartRow, numRows, 11); // Columns A-K
    
    // Create the section header (merged across all columns)
    sheet.getRange(tableStartRow, 1, 1, 11).merge();
    formatSectionHeader(sheet.getRange(tableStartRow, 1), "Representative Performance");
    
    // Create container for the table with consistent background color
    const containerRange = sheet.getRange(tableStartRow + 1, 1, numRows - 1, 11);
    containerRange.setBackground(DASHBOARD_COLORS.tileBackground)
                  .setBorder(true, true, true, true, false, false, 
                            DASHBOARD_COLORS.tileBorder, 
                            SpreadsheetApp.BorderStyle.SOLID);
    
    // Set the background color for spacer columns to match dashboard background
    // This ensures visual consistency with KPI tiles
    const spacerColumns = [3, 6, 9]; // Columns C, F, I
    spacerColumns.forEach(col => {
      sheet.getRange(tableStartRow + 1, col, numRows - 1, 1)
           .setBackground(DASHBOARD_COLORS.background);
    });
    
    // Create table headers
    const headerRow = tableStartRow + 2;
    createPerformanceTableHeaders(sheet, headerRow);
    
    // Create data rows
    const dataStartRow = headerRow + 1;
    createPerformanceDataRows(sheet, dataStartRow, repData);
    
    // Add column dividers
    addPerformanceTableDividers(sheet, headerRow, repData.length);
    
    // Return next available row with spacing
    return tableStartRow + numRows + 1;
    
  } catch (error) {
    Logger.log(`Error creating rep performance table: ${error.message}`);
    // Create empty table structure
    createEmptyPerformanceTable(sheet, startRow + 2);
    return startRow + 12;
  }
}

/**
 * Creates headers for the performance table using the flexible grid
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - Row for headers
 */
function createPerformanceTableHeaders(sheet, row) {
  // Two-row header: first row = 4 wide merged headers, second row = subheaders for each data column
  // Row 1: A-C (Rep Name), D-F (Performance Metrics), G-I (Milestone Progress), J-L (Rewards & Negatives)
  sheet.setRowHeight(row, 30);
  sheet.getRange(row, 1, 1, 3).merge().setValue("Rep Name").setBackground("#f1f3f4");
  sheet.getRange(row, 4, 1, 3).merge().setValue("Performance Metrics").setBackground("#f1f3f4");
  sheet.getRange(row, 7, 1, 3).merge().setValue("Milestone Progress").setBackground("#f1f3f4");
  sheet.getRange(row, 10, 1, 3).merge().setValue("Rewards & Negatives").setBackground("#f1f3f4");
  sheet.getRange(row, 1, 1, 12).setFontSize(12).setFontWeight("bold").setFontColor(DASHBOARD_COLORS.headerText).setVerticalAlignment("middle").setHorizontalAlignment("center");
  // Row 2: subheaders
  const subRow = row + 1;
  sheet.setRowHeight(subRow, 24);
  sheet.getRange(subRow, 1).setValue("Rep Name");
  sheet.getRange(subRow, 2).setValue(""); // merged with 1
  sheet.getRange(subRow, 3).setValue(""); // merged with 1
  sheet.getRange(subRow, 4).setValue("Responses");
  sheet.getRange(subRow, 5).setValue("Rating");
  sheet.getRange(subRow, 6).setValue("5★ Today");
  sheet.getRange(subRow, 7).setValue("5★ Total");
  sheet.getRange(subRow, 8).setValue("Milestone Progress");
  sheet.getRange(subRow, 9).setValue(""); // merged with 8
  sheet.getRange(subRow, 10).setValue("Reward Due");
  sheet.getRange(subRow, 11).setValue("Negatives");
  sheet.getRange(subRow, 12).setValue(""); // merged with 10
  sheet.getRange(subRow, 1, 1, 12).setFontSize(11).setFontWeight("normal").setFontColor(DASHBOARD_COLORS.headerText).setVerticalAlignment("middle").setHorizontalAlignment("center");
}

/**
 * Creates data rows for representatives using the flexible grid
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row for data
 * @param {Array} repData - Array of rep performance objects
 */
function createPerformanceDataRows(sheet, startRow, repData) {
  repData.forEach((rep, index) => {
    const currentRow = startRow + index;
    // Determine row background color based on performance
    let backgroundColor;
    switch (rep.performanceLevel) {
      case 'good': backgroundColor = "#E8F5E9"; break;
      case 'medium': backgroundColor = "#FFF8E1"; break;
      case 'poor': backgroundColor = "#FFEBEE"; break;
      default: backgroundColor = "white";
    }
    // Format the entire row
    sheet.getRange(currentRow, 1, 1, 12)
         .setBackground(backgroundColor)
         .setBorder(true, true, true, true, false, false, "#e0e0e0", SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(currentRow, 40);
    // Data columns: Rep Name, Responses, Rating, 5★ Today, 5★ Total, Milestone Progress, Reward Due, Negatives
    sheet.getRange(currentRow, 1, 1, 3).merge().setValue(rep.repName).setHorizontalAlignment("left");
    sheet.getRange(currentRow, 4).setValue(rep.totalResponses);
    sheet.getRange(currentRow, 5).setValue(rep.avgRating.toFixed(1));
    sheet.getRange(currentRow, 6).setValue(rep.fiveStarsToday);
    sheet.getRange(currentRow, 7).setValue(rep.fiveStarsTotal);
    // Milestone Progress: merge H-I (8-9)
    sheet.getRange(currentRow, 8, 1, 2).merge().setValue(rep.milestoneProgress.progressText).setHorizontalAlignment("center");
    sheet.getRange(currentRow, 10).setValue(rep.rewardDue > 0 ? `£${rep.rewardDue} (earned)` : "-");
    sheet.getRange(currentRow, 11).setValue(rep.negatives);
    // Rewards & Negatives: merge K-L (11-12) for future extensibility, but fill only K for now
    sheet.getRange(currentRow, 11, 1, 2).merge();
    sheet.getRange(currentRow, 1, 1, 12).setFontSize(12).setVerticalAlignment("middle");
  });
}

/**
 * Creates a milestone progress bar with visual bar representation
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - Row for the progress bar
 * @param {number} col - Column for the progress bar
 * @param {Object} progress - Progress object
 * @param {string} performanceLevel - Performance level for color
 */
function createMilestoneProgressBar(sheet, row, col, progress, performanceLevel) {
  // Merge cells G-H for progress bar (third KPI tile position)
  const cell = sheet.getRange(row, col, 1, 2).merge();
  
  // Determine bar color
  let barColor;
  switch (performanceLevel) {
    case 'good':
      barColor = DASHBOARD_COLORS.positive;
      break;
    case 'medium':
      barColor = DASHBOARD_COLORS.warning;
      break;
    case 'poor':
      barColor = DASHBOARD_COLORS.negative;
      break;
    default:
      barColor = DASHBOARD_COLORS.neutral;
  }
  
  // Create visual progress bar using conditional formatting
  const progressPercent = Math.min(100, Math.max(0, progress.percentage));
  
  // Set background with gradient-like effect
  cell.setBackground("#ECEFF1"); // Base gray background
  
  // Create a visual bar using colored background with opacity
  if (progressPercent > 0) {
    const opacity = progressPercent / 100;
    cell.setBackground(adjustColorOpacity(barColor, opacity * 0.7));
  }
  
  // Add text with progress
  cell.setValue(progress.progressText)
      .setHorizontalAlignment("center")
      .setFontColor("white")
      .setFontWeight("bold");
  
  // If progress is low, use dark text for better contrast
  if (progressPercent < 30) {
    cell.setFontColor(barColor);
  }
}

/**
 * Adds column dividers to the table
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} headerRow - Header row
 * @param {number} dataRowCount - Number of data rows
 */
function addPerformanceTableDividers(sheet, headerRow, dataRowCount) {
  // Add vertical dividers at spacer columns to visually separate KPI-aligned sections
  // Our spacer columns are C, F, and I (3, 6, 9)
  const spacerColumns = [3, 6, 9]; // Spacer columns between KPI tile sections
  
  // Add borders to the left of each content section (after spacers)
  spacerColumns.forEach(col => {
    // Add border to the right of each spacer column
    const range = sheet.getRange(headerRow, col, dataRowCount + 1, 1);
    range.setBorder(null, true, null, null, null, null, DASHBOARD_COLORS.tileBorder, SpreadsheetApp.BorderStyle.SOLID);
    
    // Also add border to the left of each spacer column
    const leftRange = sheet.getRange(headerRow, col - 1, dataRowCount + 1, 1);
    leftRange.setBorder(null, true, null, null, null, null, DASHBOARD_COLORS.tileBorder, SpreadsheetApp.BorderStyle.SOLID);
  });
}

/**
 * Creates an empty performance table structure
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row
 */
function createEmptyPerformanceTable(sheet, startRow) {
  // Use consistent spacing and width as normal table
  const numRows = 8;
  
  // Clear and set up the table area
  clearSectionArea(sheet, startRow, numRows, 11);
  
  // Create section header
  sheet.getRange(startRow, 1, 1, 11).merge();
  formatSectionHeader(sheet.getRange(startRow, 1), "Representative Performance");
  
  // Create container with consistent background color
  const containerRange = sheet.getRange(startRow + 1, 1, numRows - 1, 11);
  containerRange.setBackground(DASHBOARD_COLORS.tileBackground)
                .setBorder(true, true, true, true, false, false, 
                          DASHBOARD_COLORS.tileBorder, 
                          SpreadsheetApp.BorderStyle.SOLID);
                          
  // Set the background color for spacer columns to match dashboard background
  // This ensures visual consistency with KPI tiles
  const spacerColumns = [3, 6, 9]; // Columns C, F, I
  spacerColumns.forEach(col => {
    sheet.getRange(startRow + 1, col, numRows - 1, 1)
         .setBackground(DASHBOARD_COLORS.background);
  });
  
  // Create headers
  createPerformanceTableHeaders(sheet, startRow + 2);
  
  // Add empty message that spans all content columns (respecting spacers)
  const messageRow = startRow + 3;
  
  // Create empty message in each KPI tile position
  // First KPI tile position (A-B)
  sheet.getRange(messageRow, 1, 1, 2).merge()
       .setValue("No data")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle")
       .setFontStyle("italic")
       .setFontColor(DASHBOARD_COLORS.subText);
       
  // Second KPI tile position (D-E)
  sheet.getRange(messageRow, 4, 1, 2).merge()
       .setValue("No metrics")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle")
       .setFontStyle("italic")
       .setFontColor(DASHBOARD_COLORS.subText);
       
  // Third KPI tile position (G-H)
  sheet.getRange(messageRow, 7, 1, 2).merge()
       .setValue("No progress")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle")
       .setFontStyle("italic")
       .setFontColor(DASHBOARD_COLORS.subText);
       
  // Fourth KPI tile position (J-K)
  sheet.getRange(messageRow, 10, 1, 2).merge()
       .setValue("No rewards/negatives")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle")
       .setFontStyle("italic")
       .setFontColor(DASHBOARD_COLORS.subText);
   
  // Add dividers to maintain visual consistency with populated table
  addPerformanceTableDividers(sheet, startRow + 2, 4); // Add dividers for a few empty rows
}

/**
 * Adjusts color opacity
 * @param {string} color - Hex color
 * @param {number} opacity - Opacity value (0-1)
 * @return {string} - Adjusted color
 */
function adjustColorOpacity(color, opacity) {
  // Simple approximation - blend with white
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  
  const newR = Math.round(r + (255 - r) * (1 - opacity));
  const newG = Math.round(g + (255 - g) * (1 - opacity));
  const newB = Math.round(b + (255 - b) * (1 - opacity));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Test function for the performance table
 */
function testPerformanceTable() {
  // Use test data to create table
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  // Clear existing content
  sheet.clear();
  
  // Format background (this function exists in Headers module)
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
       .setBackground("#f8f9fa");
  sheet.setHiddenGridlines(true);
  
  // Create header
  const headerRows = createDashboardHeader();
  
  // Create KPI tiles
  const kpiRows = createKPITiles(headerRows);
  
  // Create performance table
  createRepPerformanceTable(kpiRows);
  
  Logger.log("Performance table test completed");
}