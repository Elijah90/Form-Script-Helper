# CASAMANCE Dashboard Project Background Script

**Project Files:**

- [Module Controller](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Module%20Controller].js)

- [Headers Module](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Headers].js)
- [Dashboard Config](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[DashboardConfig].js)
- [Layout Utilities](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[LayoutUtils].js)
- [KPI Tiles](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[KPI%20Titles].js)
- [Response Data](Customer%20Feedback%20%20Form%20(Responses).xlsx)
- [SVG Wireframe](Visuals/SVG%20WireFrame/ChatGPT_DailyDash_Proposed.svg)
- [Latest Screenshot](Visuals/Screenshots/New_DailyDashboard1/DailyDash1_@_Implementing_DropDownSource_insideSheet[SUCCESS]%20+%20ISSUE:%20Some%20KPI%20figues%20missing%20[RESOLVED].png)
- [Google Sheet saved as Excel](Customer%20Feedback%20%20Form%20(Responses).xlsx)

## Project Context

...

I'm developing a customized dashboard for CASAMANCE, a company that distributes textile products to design professionals. The dashboard tracks sales representative performance based on customer feedback collected through Google Forms, with a focus on a reward system for representatives who achieve specific 5-star rating milestones (10, 15, or 20 five-star ratings earn rewards of £500, £750, and £1,000 respectively).

The dashboard system has the following requirements:

- Daily, weekly, and monthly views to track performance
- KPI indicators showing submissions, ratings, and negative cases
- Rep performance tracking tied to a reward system
- Negative feedback queue for quick customer retention
- Time and distribution analysis for better resource allocation

I've successfully implemented the dashboard header and KPI tiles sections, and need help implementing the remaining components.

## Current Implementation Status

I've built a modular codebase in Google Apps Script with these modules:

1. **Module Controller**: Central dashboard refresh system
2. **Headers**: Dashboard title and date display
3. **DashboardConfig**: Configuration and data source selection system
4. **LayoutUtils**: Common styling and layout utilities
5. **KPI Tiles**: The key metrics section showing 4 main KPIs

## Current Dashboard Overview

The dashboard has a clean, modern interface with these elements:

- A header with title and timestamp

- 4 KPI tiles showing:
  - Submissions Today (with day-over-day change)
  - Average Rating (with highlighting and change indicator)
  - 5-Star Ratings (with percentage context)
  - Negative Cases Percentage (with action item count)
- Data source selector for testing with different data sheets

## Key Implementation Features

The code is structured to maintain separation of concerns:

- Layout and styling functions are separated from data processing logic
- Configuration is centralized for easy changes
- Error handling and fallbacks are in place for missing data

## Code Files

I have the following JavaScript files in my Google Apps Script project:

### DailyDash_New [Module Controller].js

> Latestest Update to be found at [DailyDash_New [Module Controller].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Module%20Controller].js)

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
  
  // Always ensure dashboard controls exist
  if (!dashboardControlsExist()) {
    addDashboardControls();
    ss.toast("Dashboard controls have been set up. Select your data source and press Refresh again.", 
             "Setup Complete", 5);
    return;
  }
  
  // Get the selected data source
  const dataSource = getDataSourceSheet();
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
    setDataSourceSheet(dataSource);
    
    // Create header and get the next row
    let nextRow = createDashboardHeader();
    Logger.log("Header refreshed. Next row: " + nextRow);
    
    // Add KPI tiles when implemented
    if (typeof createKPITiles === 'function') {
      nextRow = createKPITiles(nextRow);
      Logger.log("KPI tiles refreshed. Next row: " + nextRow);
    }
    
    // Add Rep Performance table when implemented
    if (typeof createRepPerformanceTable === 'function') {
      nextRow = createRepPerformanceTable(nextRow);
      Logger.log("Rep Performance table refreshed. Next row: " + nextRow);
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
    ss.toast("Error refreshing dashboard: " + error.message, "Refresh Error", 5);
    
    // Ensure controls are restored even if there's an error
    addDashboardControls();
  }
}
```

### DailyDash_New [Headers].js

> Latestest Update to be found at [DailyDash_New [Headers].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[Headers].js)

```javascript
/**
 * Creates the header section of the CASAMANCE Daily Dashboard
 * Includes title, date, and last updated timestamp
 */
function createDashboardHeader() {
    // Get the DailyDash sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DailyDash');
    
    // Only clear content, NOT formatting (this preserves your background color)
    sheet.getRange("A1:O5").clearContent();
    
    // Set column widths for better layout
    sheet.setColumnWidth(1, 140); // A
    sheet.setColumnWidth(2, 140); // B
    sheet.setColumnWidth(3, 140); // C
    sheet.setColumnWidth(4, 140); // D
    sheet.setColumnWidth(5, 140); // E
    sheet.setColumnWidth(6, 140); // F
    sheet.setColumnWidth(7, 140); // G
    sheet.setColumnWidth(8, 140); // H
    sheet.setColumnWidth(9, 140); // I
    sheet.setColumnWidth(10, 140); // J
    
    // Merge cells for title and set values
    sheet.getRange("A1:E1").merge();
    sheet.getRange("A1").setValue("CASAMANCE Daily Performance Dashboard");
    
    // Get current date and format it
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || "GMT", "MMMM d, yyyy");
    const formattedTime = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || "GMT", "HH:mm");
    
    // Set date and last updated
    sheet.getRange("A2:E2").merge();
    sheet.getRange("A2").setValue(`Date: ${formattedDate} • Last updated: ${formattedTime}`);
    
    // Apply formatting to title
    sheet.getRange("A1").setFontWeight("bold")
                        .setFontSize(18)
                        .setFontColor("#333333");
    
    // Apply formatting to date/time
    sheet.getRange("A2").setFontSize(12)
                        .setFontColor("#666666");
    
    // Add some padding space before KPIs
    sheet.setRowHeight(3, 15);
    
    // Return the next row for continuation
    return 4; // This will be the starting row for KPIs
}
```

### DailyDash_New [DashboardConfig].js

> Latestest Update to be found at [DailyDash_New [DashboardConfig].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[DashboardConfig].js)

```javascript
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
```

### DailyDash_New [LayoutUtils].js

> Latestest Update to be found at [DailyDash_New [LayoutUtils].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[LayoutUtils].js)

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
  neutral: "#2196F3"      // Blue
};

/**
 * Sets up the standard dashboard column widths for proper layout
 * @param {Sheet} sheet - The Google Sheet to format
 */
function setDashboardColumnWidths(sheet) {
  // Set column widths for KPI tiles with proper width distribution and spacing
  sheet.setColumnWidth(1, 170); // A - First KPI main column
  sheet.setColumnWidth(2, 60);  // B - First KPI indicator column
  sheet.setColumnWidth(3, 30);  // C - Spacer between tiles
  sheet.setColumnWidth(4, 170); // D - Second KPI main column
  sheet.setColumnWidth(5, 60);  // E - Second KPI indicator column
  sheet.setColumnWidth(6, 30);  // F - Spacer between tiles
  sheet.setColumnWidth(7, 170); // G - Third KPI main column
  sheet.setColumnWidth(8, 60);  // H - Third KPI indicator column
  sheet.setColumnWidth(9, 30);  // I - Spacer between tiles
  sheet.setColumnWidth(10, 170); // J - Fourth KPI main column
  sheet.setColumnWidth(11, 60);  // K - Fourth KPI indicator column
  
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
  sheet.setRowHeight(startRow + 2, 25); // Subtitle row
  sheet.setRowHeight(startRow + 3, 25); // Additional info row (if needed)
  sheet.setRowHeight(startRow + 4, 15); // Spacing row
}

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
  
  // If no change, we're done
  if (change === 0) return;
  
  // Create the change indicator text
  let changeText = "";
  let changeColor = DASHBOARD_COLORS.subText;
  
  if (change > 0) {
    changeText = "▲ " + Math.abs(change);
    changeColor = reverseColors ? DASHBOARD_COLORS.negative : DASHBOARD_COLORS.positive;
  } else if (change < 0) {
    changeText = "▼ " + Math.abs(change);
    changeColor = reverseColors ? DASHBOARD_COLORS.positive : DASHBOARD_COLORS.negative;
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
 * Creates a yellow highlight bar for the Average Rating KPI
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} row - The row for the highlight bar
 * @param {number} column - The column for the highlight bar
 */
function createYellowHighlightBar(sheet, row, column) {
  // Highlight spans both columns of the tile
  sheet.getRange(row, column, 1, 2)
       .setBackground(DASHBOARD_COLORS.warning); // Yellow highlight
}

// Other utility functions for formatting tables, sections, etc.
```

### DailyDash_New [KPI Titles].js

> Latestest Update to be found at [DailyDash_New [KPI Titles].js](CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New%20[KPI%20Titles].js)

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
  
  try {
    // Get the data source sheet name from config
    const dataSheetName = getDataSourceSheet();
    
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
    
    // Define KPI tiles configuration
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
    
    // Create each KPI tile
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
 * Creates a single KPI tile
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 * @param {Object} tileConfig - The tile configuration object
 */
function createSimpleKPITile(sheet, startRow, tileConfig) {
  // Format the tile container to span 2 columns
  formatTile(sheet.getRange(startRow, tileConfig.column, 5, 2));
  
  // Set the title to span both columns
  sheet.getRange(startRow, tileConfig.column, 1, 2)
       .merge()
       .setValue(tileConfig.title)
       .setFontSize(14)
       .setFontColor("#666666")
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left");
  
  // Set the main value with change indicator (each in its own column)
  formatKpiValueWithChange(
    sheet, 
    startRow + 1, 
    tileConfig.column, 
    tileConfig.value, 
    tileConfig.change, 
    tileConfig.title === "% Negative Cases"
  );
  
  // Set the subtitle to span both columns
  sheet.getRange(startRow + 2, tileConfig.column, 1, 2)
       .merge()
       .setValue(tileConfig.subtitle)
       .setFontSize(12)
       .setFontColor("#666666")
       .setVerticalAlignment("top")
       .setHorizontalAlignment("left");
  
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
```

## Sheet Structure

The Google Sheet has the following key sheets:

1. **DailyDash**: The main dashboard sheet where all visualizations are displayed
2. **Form Responses 1**: Contains actual form submission data (when connected to a real form)
3. **TestData**: Contains simulated data for testing the dashboard
4. **DashConfig**: Hidden sheet storing dashboard configuration

## Form Structure

The feedback form collects the following data points:

- Timestamp

- Customer email

- Representative name

- Whether needs were met

- Satisfaction with presentation

- Information and product knowledge

- Customer feedback comments

- Rating on a scale of 1-5 stars

## Next Steps

The next components to implement are:

1. **Rep Performance Table**: Shows detailed metrics for each rep, including 5-star count progress toward milestones

2. **Milestone Alerts**: Displays reps who've reached reward milestones (10/15/20 five-star ratings) with reward amounts

3. **Negative Feedback Queue**: Lists recent negative feedback cases (ratings ≤2 or "No" responses) for quick follow-up

4. **Rating Distribution**: Visual chart showing the distribution of ratings (1-5 stars)

5. **Submission Time Analysis**: Shows when submissions occur throughout the day for staffing insights

Each component should follow the same pattern:

- Clear separation between layout and data processing
- Proper error handling
- Consistent styling using the LayoutUtils module
- Integration with the configuration system
