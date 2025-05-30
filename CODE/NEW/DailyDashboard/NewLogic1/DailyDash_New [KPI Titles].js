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
  enforceDashboardColumnWidths(sheet);
  
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
      createEmptyKPITiles(sheet, startRow);
      return startRow + 3; // Adjusted for 3-row KPI tiles
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
      return startRow + 3; // Adjusted for 3-row KPI tiles
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
    
    // Clear the KPI area and set up layout for 3-row KPIs
    clearSectionArea(sheet, startRow, 3, 22); // Clear enough columns for new grid
    setKpiRowHeights(sheet, startRow); // This now sets for 3 rows
    
    // Define KPI tiles configuration using new grid columns
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
    
    // Add spacing after KPI section (after 3 rows)
    addSectionSpacing(sheet, startRow + 2); 
    
  } catch (error) {
    Logger.log(`Error in KPI tiles: ${error.message}`);
    createEmptyKPITiles(sheet, startRow);
  }
  
  // Return the next available row (startRow + 3 rows for KPIs)
  return startRow + 3;
}

/**
 * Creates a single KPI tile using the flexible layout system
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 * @param {Object} tileConfig - The tile configuration object
 */
function createSimpleKPITile(sheet, startRow, tileConfig) {
  // Map tile index to band names for first and second visual columns
  const bandMap = [
    { first: 'tile1_first', second: 'tile1_second' },
    { first: 'tile2_first', second: 'tile2_second' },
    { first: 'tile3_first', second: 'tile3_second' },
    { first: 'tile4_first', second: 'tile4_second' }
  ];
  const tileIndex = [1, 4, 7, 10].indexOf(tileConfig.column);
  const bands = bandMap[tileIndex];
  if (!bands) throw new Error('Invalid tile column for band mapping');

  // Get columns for first and second visual columns (now single columns)
  const firstCol = DASHBOARD_GRID.bands.find(b => b.name === bands.first).columns[0];
  const secondCol = DASHBOARD_GRID.bands.find(b => b.name === bands.second).columns[0];
  const leftCol = firstCol;
  const totalCols = 2; // Always two columns per tile

  // Create the container for this KPI tile (3 rows, full tile width)
  const container = createContainer(sheet, startRow, [bands.first, bands.second], 3, {
    background: DASHBOARD_COLORS.tileBackground,
    border: true
  });

  // Set the title (merged across both columns in the tile)
  sheet.getRange(startRow, leftCol, 1, totalCols).merge().setValue(tileConfig.title)
    .setFontSize(14)
    .setFontColor(DASHBOARD_COLORS.subText)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("left");

  // Set the main value in the first visual column (single column)
  sheet.getRange(startRow + 1, firstCol).setValue(tileConfig.value)
    .setFontSize(36)
    .setFontWeight("bold")
    .setFontColor(DASHBOARD_COLORS.headerText)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("left");

  // Subtitle in the second visual column (single column), left-aligned
  if (tileConfig.title === "Average Rating" || tileConfig.title === "5-Star Ratings") {
    sheet.getRange(startRow + 1, secondCol).setValue(tileConfig.subtitle)
      .setFontSize(12)
      .setFontColor(DASHBOARD_COLORS.subText)
      .setVerticalAlignment("middle")
      .setHorizontalAlignment("left");
  } else {
    sheet.getRange(startRow + 1, secondCol).setValue("");
  }

  // Set the change indicator (merged across both columns in the tile)
  const changeCell = sheet.getRange(startRow + 2, leftCol, 1, totalCols).merge();
  changeCell.setValue(formatChangeIndicatorText(tileConfig.change, tileConfig.subtitle, tileConfig.title))
    .setFontSize(12)
    .setFontColor(getChangeColor(tileConfig.change, tileConfig.title))
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("left");
  // For '% Negative Cases', set the subtitle as a cell note only
  if (tileConfig.title === "% Negative Cases") {
    changeCell.setNote(tileConfig.subtitle);
  } else {
    changeCell.setNote("");
  }

  // Apply yellow highlight bar for Average Rating only
  if (tileConfig.title === "Average Rating") {
    sheet.getRange(startRow + 1, leftCol, 1, totalCols).setBackground(DASHBOARD_COLORS.warning);
  }
}

// Helper to format the change indicator text
function formatChangeIndicatorText(change, subtitle, title) {
  let changeText = "";
  if (change > 0) changeText = `▲ ${Math.abs(change)}`;
  else if (change < 0) changeText = `▼ ${Math.abs(change)}`;
  else changeText = "— 0";
  if (title === "% Negative Cases") return `${changeText} vs. yesterday\n${subtitle}`;
  return `${changeText} vs. yesterday`;
}

// Helper to get the color for the change indicator
function getChangeColor(change, title) {
  if (title === "% Negative Cases") {
    if (change < 0) return DASHBOARD_COLORS.positive;
    if (change > 0) return DASHBOARD_COLORS.negative;
    return DASHBOARD_COLORS.warning;
  } else {
    if (change < 0) return DASHBOARD_COLORS.negative;
    if (change > 0) return DASHBOARD_COLORS.positive;
    return DASHBOARD_COLORS.warning;
  }
}

/**
 * Creates empty KPI tiles when data cannot be loaded
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} startRow - The starting row
 */
function createEmptyKPITiles(sheet, startRow) {
  enforceDashboardColumnWidths(sheet);
  // Clear the KPI area and set up layout for 3-row KPIs
  clearSectionArea(sheet, startRow, 3, 22); // Clear enough columns for new grid
  setKpiRowHeights(sheet, startRow); // This now sets for 3 rows
  
  // Define KPI tiles with empty values using the same columns as the main function
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
  
  // Add spacing after KPI section (after 3 rows)
  addSectionSpacing(sheet, startRow + 2);
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

function testKPITilesWithContainers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DailyDash');
  setupDashboardGrid(sheet);
  setKpiRowHeights(sheet, 4);
  // Example: create all four KPI tiles using containers
  const kpiTiles = [
    { title: "Submissions Today", value: 110, change: 40, subtitle: "vs. yesterday", column: 1 },
    { title: "Average Rating", value: "3.7", change: 0.6, subtitle: "(out of 5.0)", column: 4 },
    { title: "5-Star Ratings", value: 21, change: 15, subtitle: "19% of total", column: 7 },
    { title: "% Negative Cases", value: "8%", change: -18, subtitle: "Action needed: 3 cases", column: 10 }
  ];
  for (let i = 0; i < kpiTiles.length; i++) {
    createSimpleKPITile(sheet, 4, kpiTiles[i]);
  }
}