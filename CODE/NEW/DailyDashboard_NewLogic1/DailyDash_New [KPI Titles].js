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
    // Inside createKPITiles function, update the kpiTiles array:
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
    column: 4  // Column D (was 3)
  },
  {
    title: "5-Star Ratings",
    value: todayFiveStars,
    change: fiveStarChange,
    subtitle: fiveStarPercentage + "% of total",
    column: 7  // Column G (was 5)
  },
  {
    title: "% Negative Cases",
    value: todayNegativePercentage + "%",
    change: negativePercentageChange,
    subtitle: "Action needed: " + todayNegatives + " cases",
    column: 10  // Column J (was 7)
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
 * Creates a single KPI tile with a simpler approach that avoids rich text formatting
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 * @param {Object} tileConfig - The tile configuration object
 */

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
  
  // Check if this is the 5-Star Ratings tile
  const isFiveStarRating = tileConfig.title === "5-Star Ratings";
  
  // Set the main value with change indicator (each in its own column)
  formatKpiValueWithChange(
    sheet, 
    startRow + 1, 
    tileConfig.column, 
    tileConfig.value, 
    tileConfig.change, 
    tileConfig.title === "% Negative Cases",
    isFiveStarRating
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
  // Create header and get the next row
  const startRow = createDashboardHeader();
  
  // Create KPI tiles and get the next row
  const nextRow = createKPITiles(startRow);
  
  // Log the result
  Logger.log("KPI tiles section created. Next row: " + nextRow);
}

/**
 * Creates KPI tiles section with the main metrics
 * @param {number} startRow - The starting row for the section
 * @returns {number} - The next row after this section
 */
function createKPITiles(startRow) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DailyDash');
  const dataSource = getSelectedDataSource();
  
  // Set row heights for the KPI section
  setKpiRowHeights(sheet, startRow);
  
  // Create the KPI tiles
  createSubmissionsTile(sheet, startRow, 1, dataSource);
  createAverageRatingTile(sheet, startRow, 3, dataSource);
  createFiveStarRatingsTile(sheet, startRow, 5, dataSource);
  createNegativeCasesTile(sheet, startRow, 7, dataSource);
  
  // Add spacing after KPI section
  addSectionSpacing(sheet, startRow + 6);
}

/**
 * Creates the Submissions Today KPI tile
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - The starting row for the tile
 * @param {number} startCol - The starting column for the tile
 * @param {object} dataSource - The data source object
 */
function createSubmissionsTile(sheet, startRow, startCol, dataSource) {
  // Create tile container
  formatTile(sheet.getRange(startRow, startCol, 5, 2));
  
  // Add title
  formatKpiTitle(sheet, startRow, startCol, "Submissions Today");
  
  // Get today's and yesterday's data
  const today = new Date();
  const todayData = getTodayData(dataSource);
  const yesterdayData = getYesterdayData(dataSource);
  
  // Calculate the KPI value and change
  const submissionsToday = todayData ? todayData.submissions : 0;
  const submissionsYesterday = yesterdayData ? yesterdayData.submissions : 0;
  const change = submissionsToday - submissionsYesterday;
  
  // Format the KPI value with change indicator
  formatKpiValueWithChange(sheet, startRow + 1, startCol, submissionsToday, change);
  
  // Add "vs. yesterday" text below the main value
  sheet.getRange(startRow + 3, startCol)
       .setValue("vs. yesterday")
       .setFontSize(10)
       .setFontColor(DASHBOARD_COLORS.subText)
       .setVerticalAlignment("top")
       .setHorizontalAlignment("left");
       
  // Move the change indicator below the "vs. yesterday" text
  if (change !== 0) {
    // Get the change indicator text and color from the current position
    const changeCell = sheet.getRange(startRow + 1, startCol + 1);
    const changeText = changeCell.getValue();
    const changeColor = changeCell.getFontColor();
    
    // Clear the original change indicator
    changeCell.clearContent();
    
    // Add the change indicator below the "vs. yesterday" text
    sheet.getRange(startRow + 4, startCol)
         .setValue(changeText)
         .setFontSize(14)
         .setFontColor(changeColor)
         .setVerticalAlignment("top")
         .setHorizontalAlignment("left");
  }
}

/**
 * Creates the Five Star Ratings KPI tile with special handling
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - The starting row for the tile
 * @param {number} startCol - The starting column for the tile
 * @param {object} dataSource - The data source object
 */
function createFiveStarRatingsTile(sheet, startRow, startCol, dataSource) {
  // Create tile container
  formatTile(sheet.getRange(startRow, startCol, 5, 2));
  
  // Add title
  formatKpiTitle(sheet, startRow, startCol, "5-Star Ratings");
  
  // Get today's and yesterday's data
  const today = new Date();
  const todayData = getTodayData(dataSource);
  const yesterdayData = getYesterdayData(dataSource);
  
  // Calculate the KPI value and change
  const fiveStarsToday = todayData ? todayData.fiveStarRatings : 0;
  const fiveStarsYesterday = yesterdayData ? yesterdayData.fiveStarRatings : 0;
  const change = fiveStarsToday - fiveStarsYesterday;
  
  // Format the KPI value with change indicator - use larger font for this specific tile
  formatKpiValueWithChange(sheet, startRow + 1, startCol, fiveStarsToday, change);
  
  // Make the change indicator slightly larger for this tile
  if (change !== 0) {
    sheet.getRange(startRow + 1, startCol + 1)
         .setFontSize(16); // Slightly larger than the default 14
  }
  
  // Add "0% of total" text below the main value
  sheet.getRange(startRow + 3, startCol)
       .setValue(Math.round((fiveStarsToday / (todayData ? todayData.totalRatings : 1)) * 100) + "% of total")
       .setFontSize(10)
       .setFontColor(DASHBOARD_COLORS.subText)
       .setVerticalAlignment("top")
       .setHorizontalAlignment("left");
}