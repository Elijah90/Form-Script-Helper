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
  // Align header structure with KPI tiles above
  // Using the same column structure as KPI tiles:
  // A-B: Rep Name (merged to match KPI tile width)
  // C: Spacer (matches KPI tile spacer)
  // D-E: Performance Metrics (merged to match KPI tile width)
  // F: Spacer (matches KPI tile spacer)
  // G-H: Milestone Progress (merged to match KPI tile width)
  // I: Spacer (matches KPI tile spacer)
  // J-K: Reward & Negatives (merged to match KPI tile width)
  
  // Set header row height
  sheet.setRowHeight(row, 30);
  
  // Format the entire header row background
  sheet.getRange(row, 1, 1, 11).setBackground(DASHBOARD_COLORS.background);
  
  // Create headers with merging that matches KPI tile structure
  // First KPI tile position (columns A-B)
  sheet.getRange(row, 1, 1, 2).merge().setValue("Sales Rep")
       .setBackground("#f1f3f4");
       
  // Spacer column C - keep empty with dashboard background
  sheet.getRange(row, 3).setValue("");
  
  // Second KPI tile position (columns D-E)
  sheet.getRange(row, 4, 1, 2).merge().setValue("Performance Metrics")
       .setBackground("#f1f3f4");
       
  // Spacer column F - keep empty with dashboard background
  sheet.getRange(row, 6).setValue("");
  
  // Third KPI tile position (columns G-H)
  sheet.getRange(row, 7, 1, 2).merge().setValue("Milestone Progress")
       .setBackground("#f1f3f4");
       
  // Spacer column I - keep empty with dashboard background
  sheet.getRange(row, 9).setValue("");
  
  // Fourth KPI tile position (columns J-K)
  sheet.getRange(row, 10, 1, 2).merge().setValue("Rewards & Negatives")
       .setBackground("#f1f3f4");
  
  // Apply consistent formatting
  sheet.getRange(row, 1, 1, 11)
       .setFontSize(12)
       .setFontWeight("bold") 
       .setFontColor(DASHBOARD_COLORS.headerText)
       .setVerticalAlignment("middle");
  
  // Center align all headers
  sheet.getRange(row, 1, 1, 11).setHorizontalAlignment("center");
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
      case 'good':
        backgroundColor = "#E8F5E9"; // Light green
        break;
      case 'medium':
        backgroundColor = "#FFF8E1"; // Light yellow
        break;
      case 'poor':
        backgroundColor = "#FFEBEE"; // Light red
        break;
      default:
        backgroundColor = "white";
    }
    
    // Format the entire row
    sheet.getRange(currentRow, 1, 1, 11)
         .setBackground(backgroundColor)
         .setBorder(true, true, true, true, false, false, "#e0e0e0", SpreadsheetApp.BorderStyle.SOLID);
    
    // Set row height
    sheet.setRowHeight(currentRow, 40);
    
    // Set data values with matching header layout
    // First KPI tile position (columns A-B) - Rep Name
    sheet.getRange(currentRow, 1, 1, 2).merge().setValue(rep.repName)
         .setHorizontalAlignment("left");
         
    // Spacer column C - keep empty
    sheet.getRange(currentRow, 3).setValue("");
    
    // Second KPI tile position (columns D-E) - Performance Metrics
    // Create a subheader with metrics in column D
    const metricsText = `Responses: ${rep.totalResponses}\nAvg Rating: ${rep.avgRating.toFixed(1)}\n5★: ${rep.fiveStarsToday} / ${rep.fiveStarsTotal}`;
    sheet.getRange(currentRow, 4, 1, 2).merge().setValue(metricsText)
         .setHorizontalAlignment("center")
         .setVerticalAlignment("middle");
         
    // Spacer column F - keep empty
    sheet.getRange(currentRow, 6).setValue("");
    
    // Third KPI tile position (columns G-H) - Milestone Progress
    createMilestoneProgressBar(sheet, currentRow, 7, rep.milestoneProgress, rep.performanceLevel);
    
    // Spacer column I - keep empty
    sheet.getRange(currentRow, 9).setValue("");
    
    // Fourth KPI tile position (columns J-K) - Rewards & Negatives
    const rewardText = rep.rewardDue > 0 ? `£${rep.rewardDue} (earned)` : "-";
    const combinedText = `Rewards: ${rewardText}\nNegatives: ${rep.negatives}`;
    sheet.getRange(currentRow, 10, 1, 2).merge().setValue(combinedText)
         .setHorizontalAlignment("center");
    
    // Apply consistent formatting
    sheet.getRange(currentRow, 1, 1, 11)
         .setFontSize(12)
         .setVerticalAlignment("middle");
    
    // No need for individual column alignment as we're using merged cells
    // that are already aligned in their respective setValue calls
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