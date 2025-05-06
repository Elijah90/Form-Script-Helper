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
  
  // Get data from Form Responses sheet
  const formSheet = ss.getSheetByName('Form Responses 1');
  if (!formSheet) {
    Logger.log("Error: Form Responses 1 sheet not found");
    return startRow + 8; // Return some rows down to avoid errors
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
  const ratingCol = headers.findIndex(header => 
    header.includes("rate our services") || 
    header.includes("1 to 5 stars") || 
    header.includes("scale of 1 to 5"));
  
  if (timestampCol === -1 || ratingCol === -1) {
    Logger.log("Error: Required columns not found in form responses");
    return startRow + 8;
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
  const avgRatingChange = todayAvgRating - yesterdayAvgRating;
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
      change: avgRatingChange.toFixed(1),
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
  
  // Create each KPI tile using the layout utilities
  kpiTiles.forEach(tile => {
    // Format the tile container
    formatTile(sheet.getRange(startRow, tile.column, 5, 1));
    
    // Set the title
    formatKpiTitle(sheet, startRow, tile.column, tile.title);
    
    // Set the main value
    formatKpiValue(sheet, startRow + 1, tile.column, tile.value);
    
    // Set the change indicator (reverse colors for negative metrics)
    formatKpiChange(sheet, startRow + 2, tile.column, tile.change, 
                   tile.title === "% Negative Cases");
    
    // Set the subtitle
    formatKpiSubtitle(sheet, startRow + 3, tile.column, tile.subtitle);
    
    // Apply special formatting for Average Rating
    if (tile.title === "Average Rating") {
      formatRatingColorBar(sheet, startRow + 4, tile.column, parseFloat(tile.value));
    }
  });
  
  // Add spacing after KPI section
  addSectionSpacing(sheet, startRow + 6);
  
  // Return the next available row
  return startRow + 7;
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