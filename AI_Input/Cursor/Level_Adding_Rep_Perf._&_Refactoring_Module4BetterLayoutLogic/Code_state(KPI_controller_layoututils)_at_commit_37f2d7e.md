# Code State at Commit 37f2d7e

This document shows the state of `DailyDash_New [KPI Titles].js`, `DailyDash_New [LayoutUtils].js`, and `DailyDash_New [Module Controller].js` as of commit `37f2d7e`.

## `CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New [KPI Titles].js` at commit `37f2d7e`

```javascript
/**
 * Creates the KPI tiles section of the CASAMANCE Daily Dashboard
 * Includes Submissions Today, Average Rating, 5-Star Ratings, and % Negative Cases
 * 
 * @param {number} startRow - The row to start creating the KPI tiles
 * @return {number} - The next row after the KPI tiles section
 */
function createKPITiles(startRow) {
  // Get the DailyDash sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  Logger.log("DEBUG: Starting createKPITiles function");
  
  try {
    // Get the data source sheet name from config
    Logger.log("DEBUG: About to get data source sheet name");
    const dataSheetName = getDataSourceSheet();
    Logger.log(`DEBUG: Data sheet name: ${dataSheetName}`);
    
    // Get data from the configured data source sheet
    const formSheet = ss.getSheetByName(dataSheetName);
    if (!formSheet) {
      Logger.log(`Error: Data sheet "${dataSheetName}" not found`);
      
      // Even if the data sheet is not found, create empty KPI tiles
      createEmptyKPITiles(sheet, startRow);
      return startRow + 7;
    }
    
    // Get today's and yesterday's dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates for comparison
    const todayString = Utilities.formatDate(today, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    const yesterdayString = Utilities.formatDate(yesterday, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    
    // Get all response data
    const responseData = formSheet.getDataRange().getValues();
    const headers = responseData[0]; // First row contains headers
    
    // Find important column indexes
    const timestampCol = headers.indexOf("Timestamp");
    let ratingCol = headers.findIndex(header => 
      (typeof header === 'string') && (
        header.includes("rate our services") || 
        header.includes("1 to 5 stars") || 
        header.includes("scale of 1 to 5")
      )
    );
    
    // Fallback: Try to find any column that might contain ratings
    if (ratingCol === -1) {
      ratingCol = headers.findIndex(header => 
        (typeof header === 'string') && (
          header.includes("rating") || 
          header.includes("stars") || 
          header.includes("score")
        )
      );
    }

    // Last resort: Check the last column (often contains rating in form responses)
    if (ratingCol === -1) {
      ratingCol = headers.length - 1;
      Logger.log("Warning: Using last column as rating column");
    }
    
    if (timestampCol === -1) {
      Logger.log(`Error: Timestamp column not found in "${dataSheetName}" sheet`);
      createEmptyKPITiles(sheet, startRow);
      return startRow + 7;
    }
    
    // Count submissions and calculate metrics
    let todaySubmissions = 0;
    let yesterdaySubmissions = 0;
    let todayRatings = [];
    let yesterdayRatings = [];
    let todayFiveStars = 0;
    let yesterdayFiveStars = 0;
    let todayNegatives = 0;
    let yesterdayNegatives = 0;
    
    // Process all responses (skipping header row)
    for (let i = 1; i < responseData.length; i++) {
      const row = responseData[i];
      
      // Skip rows with no timestamp
      if (!row[timestampCol]) continue;
      
      // Format the timestamp for comparison
      const responseDate = new Date(row[timestampCol]);
      const responseDateString = Utilities.formatDate(responseDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
      
      // Get the rating (1-5)
      const rating = parseFloat(row[ratingCol]);
      
      // Check if it's today's submission
      if (responseDateString === todayString) {
        todaySubmissions++;
        if (!isNaN(rating)) {
          todayRatings.push(rating);
          if (rating === 5) todayFiveStars++;
          if (rating <= 2) todayNegatives++; // Count ratings of 1-2 as negative
        }
      }
      // Check if it's yesterday's submission
      else if (responseDateString === yesterdayString) {
        yesterdaySubmissions++;
        if (!isNaN(rating)) {
          yesterdayRatings.push(rating);
          if (rating === 5) yesterdayFiveStars++;
          if (rating <= 2) yesterdayNegatives++;
        }
      }
    }
    
    // Calculate averages and percentages
    const todayAvgRating = todayRatings.length > 0 ? 
      todayRatings.reduce((sum, rating) => sum + rating, 0) / todayRatings.length : 0;
    
    const yesterdayAvgRating = yesterdayRatings.length > 0 ? 
      yesterdayRatings.reduce((sum, rating) => sum + rating, 0) / yesterdayRatings.length : 0;
    
    const todayNegativePercentage = todaySubmissions > 0 ? 
      Math.round((todayNegatives / todaySubmissions) * 100) : 0;
    
    const yesterdayNegativePercentage = yesterdaySubmissions > 0 ? 
      Math.round((yesterdayNegatives / yesterdaySubmissions) * 100) : 0;
    
    // Calculate day-over-day changes
    const submissionChange = todaySubmissions - yesterdaySubmissions;
    const avgRatingChange = parseFloat((todayAvgRating - yesterdayAvgRating).toFixed(1));
    const fiveStarChange = todayFiveStars - yesterdayFiveStars;
    const negativePercentageChange = todayNegativePercentage - yesterdayNegativePercentage;
    
    // Calculate percentage of 5-star ratings
    const fiveStarPercentage = todaySubmissions > 0 ? 
      Math.round((todayFiveStars / todaySubmissions) * 100) : 0;
    
    // Clear the KPI area and set up layout
    clearSectionArea(sheet, startRow, 7, 15);
    setDashboardColumnWidths(sheet);
    setKpiRowHeights(sheet, startRow);
    
    // Define KPI tiles configuration using flexible layout
    const kpiTiles = [
      {
        title: "Submissions Today",
        value: todaySubmissions,
        change: submissionChange,
        subtitle: "vs. yesterday",
        column: 1  // Column A
      },
      {
        title: "Average Rating",
        value: todayAvgRating.toFixed(1),
        change: avgRatingChange,
        subtitle: "(out of 5.0)",
        column: 4  // Column D
      },
      {
        title: "5-Star Ratings",
        value: todayFiveStars,
        change: fiveStarChange,
        subtitle: fiveStarPercentage + "% of total",
        column: 7  // Column G
      },
      {
        title: "% Negative Cases",
        value: todayNegativePercentage + "%",
        change: negativePercentageChange,
        subtitle: "Action needed: " + todayNegatives + " cases",
        column: 10  // Column J
      }
    ];
    
    // Create each KPI tile with simpler direct approach
    for (let i = 0; i < kpiTiles.length; i++) {
      try {
        createSimpleKPITile(sheet, startRow, kpiTiles[i]);
      } catch (tileError) {
        Logger.log(`Error creating KPI tile ${kpiTiles[i].title}: ${tileError.message}`);
        // Continue with other tiles even if one fails
      }
    }
    
    // Add spacing after KPI section
    addSectionSpacing(sheet, startRow + 6);
    
  } catch (error) {
    Logger.log(`Error in KPI tiles: ${error.message}`);
    createEmptyKPITiles(sheet, startRow);
  }
  
  // Return the next available row
  return startRow + 7;
}

/**
 * Creates a single KPI tile using the flexible layout system
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 * @param {Object} tileConfig - The tile configuration object
 */
function createSimpleKPITile(sheet, startRow, tileConfig) {
  // Format the tile container (spans 2 columns)
  formatTile(sheet.getRange(startRow, tileConfig.column, 5, 2));
  
  // Set the title (merged across both columns)
  formatKpiTitle(sheet, startRow, tileConfig.column, tileConfig.title);
  
  // Check if this is the 5-Star Ratings tile
  const isFiveStarRating = tileConfig.title === "5-Star Ratings";
  
  // Set the main value with change indicator
  formatKpiValueWithChange(
    sheet, 
    startRow + 1, 
    tileConfig.column, 
    tileConfig.value, 
    tileConfig.change, 
    tileConfig.title === "% Negative Cases",
    isFiveStarRating
  );
  
  // Set the subtitle (merged across both columns)
  formatKpiSubtitle(sheet, startRow + 2, tileConfig.column, tileConfig.subtitle);
  
  // Apply yellow highlight bar for Average Rating only
  if (tileConfig.title === "Average Rating") {
    createYellowHighlightBar(sheet, startRow + 1, tileConfig.column);
  }
}

/**
 * Creates empty KPI tiles when data cannot be loaded
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 */
function createEmptyKPITiles(sheet, startRow) {
  // Clear the KPI area and set up layout
  clearSectionArea(sheet, startRow, 7, 15);
  setDashboardColumnWidths(sheet);
  setKpiRowHeights(sheet, startRow);
  
  // Define KPI tiles with empty values
  const kpiTiles = [
    {
      title: "Submissions Today",
      value: 0,
      change: 0,
      subtitle: "vs. yesterday",
      column: 1  // Column A
    },
    {
      title: "Average Rating",
      value: "0.0",
      change: 0,
      subtitle: "(out of 5.0)",
      column: 4  // Column D
    },
    {
      title: "5-Star Ratings",
      value: 0,
      change: 0,
      subtitle: "0% of total",
      column: 7  // Column G
    },
    {
      title: "% Negative Cases",
      value: "0%",
      change: 0,
      subtitle: "Action needed: 0 cases",
      column: 10  // Column J
    }
  ];
  
  // Create each KPI tile using the simpler approach
  kpiTiles.forEach(tile => {
    createSimpleKPITile(sheet, startRow, tile);
  });
  
  // Add spacing after KPI section
  addSectionSpacing(sheet, startRow + 6);
}

/**
 * Test function to verify the KPI section works correctly
 */
function testKPITilesSection() {
  // Format background first
  formatDashboardBackground();
  
  // Create header and get the next row
  const startRow = createDashboardHeader();
  
  // Create KPI tiles and get the next row
  const nextRow = createKPITiles(startRow);
  
  // Log the result
  Logger.log("KPI tiles section created. Next row: " + nextRow);
}
```

## `CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New [LayoutUtils].js` at commit `37f2d7e`

```javascript
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
 * @param {boolean} is5StarRating - Whether this is the 5-Star Ratings tile
 */
function formatKpiValueWithChange(sheet, row, column, value, change, reverseColors = false, is5StarRating = false) {
  // Format the main value in the first cell
  sheet.getRange(row, column)
       .setValue(value)
       .setFontSize(36)
       .setFontWeight("bold")
       .setFontColor(DASHBOARD_COLORS.headerText)
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left")
       .setNumberFormat("@");
  
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
  
  // Clear the second cell
  sheet.getRange(row, column + 1).clearContent();
  
  if (is5StarRating) {
    // For 5-Star Ratings, show change in the second cell
    sheet.getRange(row, column + 1)
         .setValue(changeText)
         .setFontSize(18)
         .setFontColor(changeColor)
         .setVerticalAlignment("middle")
         .setHorizontalAlignment("left");
  } else {
    // For other tiles, merge cells and show "X vs. yesterday"
    const vsYesterdayCell = sheet.getRange(row + 1, column, 1, 2).merge();
    vsYesterdayCell.setValue(changeText + " vs. yesterday")
                   .setFontSize(12)
                   .setVerticalAlignment("middle")
                   .setHorizontalAlignment("left");
    
    // Apply rich text formatting
    const richText = SpreadsheetApp.newRichTextValue()
                                  .setText(changeText + " vs. yesterday")
                                  .setTextStyle(0, changeText.length, SpreadsheetApp.newTextStyle()
                                                                      .setForegroundColor(changeColor)
                                                                      .build())
                                  .setTextStyle(changeText.length, changeText.length + " vs. yesterday".length,
                                               SpreadsheetApp.newTextStyle()
                                                             .setForegroundColor(DASHBOARD_COLORS.subText)
                                                             .build())
                                  .build();
    
    vsYesterdayCell.setRichTextValue(richText);
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
```

## `CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New [Module Controller].js` at commit `37f2d7e`

```javascript
/**
 * Dashboard Controller Module
 * 
 * This module serves as the central controller for refreshing all dashboard components.
 * It coordinates the refresh process by calling the appropriate functions from each module
 * in the correct sequence.
 */

/**
 * Main function to refresh the entire dashboard
 * This will be called when the refresh button is clicked
 */
function refreshDashboard() {
  // Get the DailyDash sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  Logger.log("DEBUG: Starting dashboard refresh process");
  
  // Always ensure dashboard controls exist
  if (!dashboardControlsExist()) {
    Logger.log("DEBUG: Dashboard controls don't exist, adding them now");
    addDashboardControls();
    ss.toast("Dashboard controls have been set up. Select your data source and press Refresh again.", 
             "Setup Complete", 5);
    return;
  }
  
  Logger.log("DEBUG: About to get data source sheet name");
  // Get the selected data source
  const dataSource = getDataSourceSheet(); // Changed from getSelectedDataSource to getDataSourceSheet
  Logger.log(`DEBUG: Data source retrieved: ${dataSource}`);
  
  if (!dataSource) {
    ss.toast("Please select a data source from the dropdown first", "Data Source Required", 3);
    return;
  }
  
  // Validate the selected sheet exists
  if (!ss.getSheetByName(dataSource)) {
    ss.toast(`Selected data sheet "${dataSource}" not found. Please select a valid sheet.`, 
             "Invalid Data Source", 5);
    return;
  }
  
  // Start refresh process
  Logger.log("Starting dashboard refresh with data source: " + dataSource);
  
  try {
    // Update the config to match the dropdown (synchronize both)
    Logger.log("DEBUG: About to set data source sheet");
    setDataSourceSheet(dataSource);
    
    // Create header and get the next row
    Logger.log("DEBUG: About to create dashboard header");
    let nextRow = createDashboardHeader();
    Logger.log("Header refreshed. Next row: " + nextRow);
    
    // Add KPI tiles
    if (typeof createKPITiles === 'function') {
      Logger.log("DEBUG: About to create KPI tiles");
      nextRow = createKPITiles(nextRow);
      Logger.log("KPI tiles refreshed. Next row: " + nextRow);
    } else {
      Logger.log("DEBUG: createKPITiles function not found");
    }
    
    // Add Rep Performance table
    if (typeof createRepPerformanceTable === 'function') {
      Logger.log("DEBUG: About to create Rep Performance table");
      nextRow = createRepPerformanceTable(nextRow);
      Logger.log("Rep Performance table refreshed. Next row: " + nextRow);
    } else {
      Logger.log("DEBUG: createRepPerformanceTable function not found");
    }
    
    // Add Milestone Alerts when implemented
    if (typeof createMilestoneAlerts === 'function') {
      nextRow = createMilestoneAlerts(nextRow);
      Logger.log("Milestone Alerts refreshed. Next row: " + nextRow);
    }
    
    // Add Negative Feedback Queue when implemented
    if (typeof createNegativeFeedbackQueue === 'function') {
      nextRow = createNegativeFeedbackQueue(nextRow);
      Logger.log("Negative Feedback Queue refreshed. Next row: " + nextRow);
    }
    
    // Add Rating Distribution when implemented
    if (typeof createRatingDistribution === 'function') {
      createRatingDistribution(nextRow, 10);
      Logger.log("Rating Distribution refreshed.");
    }
    
    // Add Submission Time Analysis when implemented
    if (typeof createSubmissionTimeAnalysis === 'function') {
      createSubmissionTimeAnalysis(nextRow + 10, 10);
      Logger.log("Submission Time Analysis refreshed.");
    }
    
    // Add footer when implemented
    if (typeof addDashboardFooter === 'function') {
      addDashboardFooter(nextRow + 20);
      Logger.log("Dashboard footer added.");
    }
    
    // Ensure controls are restored after refresh
    addDashboardControls();
    
    // Show a toast notification
    ss.toast(`Dashboard refreshed successfully using data from: ${dataSource}`,
             "Refresh Complete", 3);
    Logger.log("Dashboard refresh completed successfully.");
  } catch (error) {
    // Log any errors
    Logger.log("Error refreshing dashboard: " + error.message);
    Logger.log("DEBUG: Error stack trace: " + error.stack);
    ss.toast("Error refreshing dashboard: " + error.message, "Refresh Error", 5);
    
    // Ensure controls are restored even if there's an error
    addDashboardControls();
  }
}

/**
 * Function to be executed when the spreadsheet is opened
 * Sets up the custom menu for dashboard controls
 */
function onOpen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create a custom menu
  ss.addMenu("Dashboard", [
    {name: "Refresh Now", functionName: "refreshDashboard"},
    {name: "Clear All", functionName: "clearDashboard"},
    {name: "Setup Controls", functionName: "addDashboardControls"}
  ]);
  
  // Show a welcome message
  ss.toast("Use the 'Dashboard' menu to refresh the dashboard", "Dashboard Ready", 5);
}

/**
 * Clears the entire dashboard
 * Useful for debugging or resetting
 */
function clearDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DailyDash');
  
  // Confirm before clearing
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear Dashboard',
    'Are you sure you want to clear the entire dashboard?',
    ui.ButtonSet.YES_NO
  );
  
  // If user confirms, clear the dashboard
  if (response == ui.Button.YES) {
    // Clear all content and formatting
    sheet.clear();
    
    // Reset gridlines
    sheet.setHiddenGridlines(false);
    
    // Show confirmation
    ss.toast("Dashboard cleared successfully", "Clear Complete", 3);
  }
}

/**
 * Initializes the dashboard on first use
 * Creates the sheet if it doesn't exist and sets up initial structure
 */
function initializeDashboard() {
  // Check if DailyDash sheet exists, create if it doesn't
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');
  
  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
    Logger.log("Created new DailyDash sheet");
  }
  
  // Set background color for the whole sheet
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
       .setBackground("#f8f9fa");
  
  // Ensure dashboard controls exist
  addDashboardControls();
  
  // Run the refresh dashboard function
  refreshDashboard();
  
  // Show confirmation
  ss.toast("Dashboard initialized successfully", "Setup Complete", 3);
}
```

</rewritten_file>