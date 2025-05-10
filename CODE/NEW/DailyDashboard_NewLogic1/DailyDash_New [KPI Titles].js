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
    
    // Get today's and yesterday's data
    const todayData = getTodayData(dataSheetName);
    const yesterdayData = getYesterdayData(dataSheetName);
    
    // Calculate changes
    const submissionChange = todayData.submissions - yesterdayData.submissions;
    const avgRatingChange = parseFloat((todayData.averageRating - yesterdayData.averageRating).toFixed(1));
    const fiveStarChange = todayData.fiveStarRatings - yesterdayData.fiveStarRatings;
    const negativePercentageChange = todayData.negativePercentage - yesterdayData.negativePercentage;
    
    // Calculate percentage of 5-star ratings
    const fiveStarPercentage = todayData.submissions > 0 ? 
      Math.round((todayData.fiveStarRatings / todayData.submissions) * 100) : 0;
    
    // Clear the KPI area and set up layout (reduced from 7 to 3 rows)
    clearSectionArea(sheet, startRow, 3, 15);
    setDashboardColumnWidths(sheet);
    setKpiRowHeights(sheet, startRow);
    
    // Define KPI tiles configuration
    const kpiTiles = [
      {
        title: "Submissions Today",
        value: todayData.submissions,
        change: submissionChange,
        subtitle: "vs. yesterday",
        column: 1  // Column A
      },
      {
        title: "Average Rating",
        value: todayData.averageRating.toFixed(1),
        change: avgRatingChange,
        subtitle: "", // Not used for Average Rating
        column: 4  // Column D
      },
      {
        title: "5-Star Ratings",
        value: todayData.fiveStarRatings,
        change: fiveStarChange,
        subtitle: fiveStarPercentage + "% of total",
        column: 7  // Column G
      },
      {
        title: "% Negative Cases",
        value: todayData.negativePercentage + "%",
        change: negativePercentageChange,
        subtitle: "Action needed: " + todayData.negativeCount + " cases",
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
    
    // Add spacing after KPI section (reduced from 6 to 2)
    addSectionSpacing(sheet, startRow + 2);
    
    // Clear any content that might exist in rows beyond the KPI tiles
    sheet.getRange(startRow + 3, 1, 5, 15).clearContent();
    
  } catch (error) {
    Logger.log(`Error in KPI tiles: ${error.message}`);
    createEmptyKPITiles(sheet, startRow);
  }
  
  // Return the next available row (reduced from 7 to 3)
  return startRow + 3;
}

/**
 * Gets today's data from the specified data source
 * @param {string} dataSheetName - The name of the data sheet
 * @return {Object} - Object containing today's metrics
 */
function getTodayData(dataSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(dataSheetName);
  
  if (!dataSheet) {
    Logger.log(`Error: Data sheet "${dataSheetName}" not found`);
    return getEmptyDataObject();
  }
  
  const today = new Date();
  const todayString = Utilities.formatDate(today, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  
  // Get all data
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indexes
  const timestampCol = headers.indexOf("Timestamp");
  const ratingCol = headers.findIndex(header => 
    header.includes("rate our services") || 
    header.includes("scale of 1 to 5")
  );
  
  if (timestampCol === -1) {
    Logger.log("Error: Timestamp column not found");
    return getEmptyDataObject();
  }
  
  if (ratingCol === -1) {
    Logger.log("Warning: Rating column not found, using last column");
  }
  
  let submissions = 0;
  let ratings = [];
  let fiveStarRatings = 0;
  let negativeCount = 0;
  
  // Process today's data
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[timestampCol]) continue;
    
    const responseDate = new Date(row[timestampCol]);
    const responseDateString = Utilities.formatDate(responseDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    
    if (responseDateString === todayString) {
      submissions++;
      
      // Get rating value (use last column if rating column not found)
      const ratingValue = row[ratingCol !== -1 ? ratingCol : row.length - 1];
      const rating = parseFloat(ratingValue);
      
      if (!isNaN(rating)) {
        ratings.push(rating);
        if (rating === 5) fiveStarRatings++;
        if (rating <= 2) negativeCount++; // Ratings 1-2 are considered negative
      }
    }
  }
  
  const averageRating = ratings.length > 0 ? 
    ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
  
  const negativePercentage = submissions > 0 ? 
    Math.round((negativeCount / submissions) * 100) : 0;
  
  return {
    submissions: submissions,
    ratings: ratings,
    fiveStarRatings: fiveStarRatings,
    totalRatings: ratings.length,
    averageRating: averageRating,
    negativeCount: negativeCount,
    negativePercentage: negativePercentage
  };
}

/**
 * Gets yesterday's data from the specified data source
 * @param {string} dataSheetName - The name of the data sheet
 * @return {Object} - Object containing yesterday's metrics
 */
function getYesterdayData(dataSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(dataSheetName);
  
  if (!dataSheet) {
    Logger.log(`Error: Data sheet "${dataSheetName}" not found`);
    return getEmptyDataObject();
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = Utilities.formatDate(yesterday, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  
  // Get all data
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indexes
  const timestampCol = headers.indexOf("Timestamp");
  const ratingCol = headers.findIndex(header => 
    header.includes("rate our services") || 
    header.includes("scale of 1 to 5")
  );
  
  if (timestampCol === -1) {
    Logger.log("Error: Timestamp column not found");
    return getEmptyDataObject();
  }
  
  if (ratingCol === -1) {
    Logger.log("Warning: Rating column not found, using last column");
  }
  
  let submissions = 0;
  let ratings = [];
  let fiveStarRatings = 0;
  let negativeCount = 0;
  
  // Process yesterday's data
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[timestampCol]) continue;
    
    const responseDate = new Date(row[timestampCol]);
    const responseDateString = Utilities.formatDate(responseDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    
    if (responseDateString === yesterdayString) {
      submissions++;
      
      // Get rating value (use last column if rating column not found)
      const ratingValue = row[ratingCol !== -1 ? ratingCol : row.length - 1];
      const rating = parseFloat(ratingValue);
      
      if (!isNaN(rating)) {
        ratings.push(rating);
        if (rating === 5) fiveStarRatings++;
        if (rating <= 2) negativeCount++;
      }
    }
  }
  
  const averageRating = ratings.length > 0 ? 
    ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
  
  const negativePercentage = submissions > 0 ? 
    Math.round((negativeCount / submissions) * 100) : 0;
  
  return {
    submissions: submissions,
    ratings: ratings,
    fiveStarRatings: fiveStarRatings,
    totalRatings: ratings.length,
    averageRating: averageRating,
    negativeCount: negativeCount,
    negativePercentage: negativePercentage
  };
}

/**
 * Returns an empty data object with default values
 * @return {Object} - Empty data object
 */
function getEmptyDataObject() {
  return {
    submissions: 0,
    ratings: [],
    fiveStarRatings: 0,
    totalRatings: 0,
    averageRating: 0,
    negativeCount: 0,
    negativePercentage: 0
  };
}

/**
 * Creates a single KPI tile
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 * @param {Object} tileConfig - The tile configuration object
 */
function createSimpleKPITile(sheet, startRow, tileConfig) {
  // Format the tile container to span 2 columns and 3 rows ONLY
  formatTile(sheet.getRange(startRow, tileConfig.column, 3, 2));
  
  // Set the title to span both columns (row 4)
  sheet.getRange(startRow, tileConfig.column, 1, 2)
       .merge()
       .setValue(tileConfig.title)
       .setFontSize(14)
       .setFontColor("#666666")
       .setVerticalAlignment("middle")
       .setHorizontalAlignment("left");
  
  // Check tile types
  const isFiveStarRating = tileConfig.title === "5-Star Ratings";
  const isNegativePercentage = tileConfig.title === "% Negative Cases";
  const isAverageRating = tileConfig.title === "Average Rating";
  const isSubmissionsToday = tileConfig.title === "Submissions Today";
  
  // Set the main value with change indicator (row 5)
  formatKpiValueWithChange(
    sheet, 
    startRow + 1, 
    tileConfig.column, 
    tileConfig.value, 
    tileConfig.change, 
    isNegativePercentage,  // Reverse colors for negative percentage
    isFiveStarRating,
    isAverageRating,
    isSubmissionsToday
  );
  
  // Handle special cases for different tiles
  if (isAverageRating) {
    // For Average Rating, add "(out of 5.0)" next to the main value in row 5
    sheet.getRange(startRow + 1, tileConfig.column + 1)
         .setValue("(out of 5.0)")
         .setFontSize(12)
         .setFontWeight("bold")
         .setFontColor("#666666")
         .setVerticalAlignment("middle")
         .setHorizontalAlignment("left");
  } else if (isFiveStarRating) {
    // For 5-Star Ratings, now same layout as Average Rating
    // Percentage goes in row 5 next to main value
    sheet.getRange(startRow + 1, tileConfig.column + 1)
         .setValue(tileConfig.subtitle)
         .setFontSize(12)
         .setFontWeight("bold")  // Adding bold like with Average Rating's "(out of 5.0)""
         .setFontColor("#666666")
         .setVerticalAlignment("middle")
         .setHorizontalAlignment("left");
  } else if (isNegativePercentage) {
    // For % Negative Cases, create a cell comment/note on row 6
    const cell = sheet.getRange(startRow + 2, tileConfig.column, 1, 2).merge();
    
    // Parse the number of cases from the subtitle
    const casesMatch = tileConfig.subtitle.match(/(\d+) cases/);
    const numCases = casesMatch ? parseInt(casesMatch[1]) : 0;
    
    // Create the note text
    const noteText = "Action needed: " + numCases + " cases";
    
    // Set the note on the cell
    cell.setNote(noteText);
  }
  
  // Apply yellow highlight bar for Average Rating only
  if (isAverageRating) {
    createYellowHighlightBar(sheet, startRow + 1, tileConfig.column);
  }
  
  // IMPORTANT: Clear any content that might exist in rows beyond the tile
  sheet.getRange(startRow + 3, tileConfig.column, 5, 2).clearContent();
}

/**
 * Creates empty KPI tiles when data cannot be loaded
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 */
function createEmptyKPITiles(sheet, startRow) {
  // Clear the KPI area and set up layout (reduced from 7 to 3 rows)
  clearSectionArea(sheet, startRow, 3, 15);
  setDashboardColumnWidths(sheet);
  setKpiRowHeights(sheet, startRow);
  
  // Define KPI tiles with empty values
  const kpiTiles = [
    {
      title: "Submissions Today",
      value: 0,
      change: 0,
      subtitle: "",  // Not used for Submissions Today
      column: 1  // Column A
    },
    {
      title: "Average Rating",
      value: "0.0",
      change: 0,
      subtitle: "",  // Not used for Average Rating
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
  
  // Add spacing after KPI section (reduced from 6 to 2)
  addSectionSpacing(sheet, startRow + 2);
  
  // Clear any content that might exist in rows beyond the KPI tiles
  sheet.getRange(startRow + 3, 1, 5, 15).clearContent();
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
 * Test function to verify data retrieval functions work correctly
 */
function testDataRetrieval() {
  const dataSheetName = getDataSourceSheet();
  Logger.log(`Testing data retrieval for sheet: ${dataSheetName}`);
  
  const todayData = getTodayData(dataSheetName);
  Logger.log("Today's data: " + JSON.stringify(todayData));
  
  const yesterdayData = getYesterdayData(dataSheetName);
  Logger.log("Yesterday's data: " + JSON.stringify(yesterdayData));
}