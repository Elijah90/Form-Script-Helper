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
    
    if (timestampCol === -1 || ratingCol === -1) {
      Logger.log(`Error: Required columns not found in "${dataSheetName}" sheet`);
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
        column: 3  // Column C
      },
      {
        title: "5-Star Ratings",
        value: todayFiveStars,
        change: fiveStarChange,
        subtitle: fiveStarPercentage + "% of total",
        column: 5  // Column E
      },
      {
        title: "% Negative Cases",
        value: todayNegativePercentage + "%",
        change: negativePercentageChange,
        subtitle: "Action needed: " + todayNegatives + " cases",
        column: 7  // Column G
      }
    ];
    
    // Create each KPI tile separately to avoid cascading failures
    for (let i = 0; i < kpiTiles.length; i++) {
      try {
        createSingleKPITile(sheet, startRow, kpiTiles[i]);
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
function createSingleKPITile(sheet, startRow, tileConfig) {
  // Format the tile container
  formatTile(sheet.getRange(startRow, tileConfig.column, 5, 1));
  
  // Set the title
  formatKpiTitle(sheet, startRow, tileConfig.column, tileConfig.title);
  
  // Set the main value with change indicator
  if (typeof formatKpiValueWithChange === 'function') {
    formatKpiValueWithChange(
      sheet, 
      startRow + 1, 
      tileConfig.column, 
      tileConfig.value, 
      tileConfig.change, 
      tileConfig.title === "% Negative Cases"
    );
  } else {
    // Fallback if the rich text function is not available
    formatKpiValue(sheet, startRow + 1, tileConfig.column, tileConfig.value);
    
    // Set change indicator below if we can't do it inline
    let changeText = "";
    let changeColor = "#666666";
    
    if (tileConfig.change > 0) {
      changeText = "▲ " + Math.abs(tileConfig.change);
      changeColor = tileConfig.title === "% Negative Cases" ? "#F44336" : "#4CAF50";
    } else if (tileConfig.change < 0) {
      changeText = "▼ " + Math.abs(tileConfig.change);
      changeColor = tileConfig.title === "% Negative Cases" ? "#4CAF50" : "#F44336";
    }
    
    if (changeText) {
      sheet.getRange(startRow + 2, tileConfig.column)
           .setValue(changeText)
           .setFontSize(14)
           .setFontColor(changeColor)
           .setHorizontalAlignment("left");
    }
  }
  
  // Set the subtitle
  formatKpiSubtitle(sheet, startRow + 3, tileConfig.column, tileConfig.subtitle);
  
  // Apply special formatting for Average Rating
  if (tileConfig.title === "Average Rating") {
    formatRatingColorBar(sheet, startRow + 4, tileConfig.column, parseFloat(tileConfig.value));
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
      column: 3  // Column C
    },
    {
      title: "5-Star Ratings",
      value: 0,
      change: 0,
      subtitle: "0% of total",
      column: 5  // Column E
    },
    {
      title: "% Negative Cases",
      value: "0%",
      change: 0,
      subtitle: "Action needed: 0 cases",
      column: 7  // Column G
    }
  ];
  
  // Create each KPI tile
  kpiTiles.forEach(tile => {
    // Format the tile container
    formatTile(sheet.getRange(startRow, tile.column, 5, 1));
    
    // Set the title
    formatKpiTitle(sheet, startRow, tile.column, tile.title);
    
    // Set the value
    formatKpiValue(sheet, startRow + 1, tile.column, tile.value);
    
    // Set the subtitle
    formatKpiSubtitle(sheet, startRow + 3, tile.column, tile.subtitle);
  });
  
  // Add spacing after KPI section
  addSectionSpacing(sheet, startRow + 6);
}

/**
 * Test function to verify the KPI section works correctly
 */
function testKPITilesSection() {
  // Create header and get the next row
  const startRow = createDashboardHeader();
  
  // Create KPI tiles and get the next row
  const nextRow = createKPITiles(startRow);
  
  // Log the result
  Logger.log("KPI tiles section created. Next row: " + nextRow);
}