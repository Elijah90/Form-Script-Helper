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
    return startRow + 10; // Return some rows down to avoid errors
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
  const ratingCol = headers.findIndex(header => header.includes("rate our services") || header.includes("1 to 5 stars"));
  
  if (timestampCol === -1 || ratingCol === -1) {
    Logger.log("Error: Required columns not found in form responses");
    return startRow + 10;
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
  
  // Set up grid for the KPI tiles
  const kpiRow = startRow;
  const kpiHeight = 5; // Height of each KPI tile in rows
  
  // Clear the KPI area
  sheet.getRange(kpiRow, 1, kpiHeight, 10).clearContent();
  
  // Configure KPI tiles
  
  // Define KPI structure (position, title, main value, change value, subtitle)
  const kpis = [
    {
      title: "Submissions Today",
      value: todaySubmissions,
      change: submissionChange,
      subtitle: "vs. yesterday",
      column: 1 // Column A
    },
    {
      title: "Average Rating",
      value: todayAvgRating.toFixed(1),
      change: avgRatingChange.toFixed(1),
      subtitle: "(out of 5.0)",
      column: 3 // Column C
    },
    {
      title: "5-Star Ratings",
      value: todayFiveStars,
      change: fiveStarChange,
      subtitle: `${fiveStarPercentage}% of total`,
      column: 5 // Column E
    },
    {
      title: "% Negative Cases",
      value: `${todayNegativePercentage}%`,
      change: negativePercentageChange,
      subtitle: `Action needed: ${todayNegatives} cases`,
      column: 7 // Column G
    }
  ];
  
  // Create each KPI tile
  kpis.forEach(kpi => {
    // Create border around KPI tile
    const tileRange = sheet.getRange(kpiRow, kpi.column, kpiHeight, 2);
    
    // Set KPI title
    sheet.getRange(kpiRow, kpi.column, 1, 2).merge();
    sheet.getRange(kpiRow, kpi.column)
      .setValue(kpi.title)
      .setFontSize(14)
      .setFontColor("#666666");
    
    // Set KPI value
    sheet.getRange(kpiRow + 1, kpi.column)
      .setValue(kpi.value)
      .setFontSize(36)
      .setFontWeight("bold")
      .setFontColor("#333333");
    
    // Set change indicator
    const changeCell = sheet.getRange(kpiRow + 1, kpi.column + 1);
    const changeValue = kpi.change;
    const changeSymbol = changeValue > 0 ? "▲" : (changeValue < 0 ? "▼" : "");
    const changeColor = (kpi.title === "% Negative Cases") ? 
      (changeValue > 0 ? "#F44336" : changeValue < 0 ? "#4CAF50" : "#666666") : 
      (changeValue > 0 ? "#4CAF50" : changeValue < 0 ? "#F44336" : "#666666");
    
    changeCell
      .setValue(`${changeSymbol} ${Math.abs(changeValue)}`)
      .setFontSize(14)
      .setFontColor(changeColor);
    
    // Set subtitle
    sheet.getRange(kpiRow + 2, kpi.column, 1, 2)
      .merge()
      .setValue(kpi.subtitle)
      .setFontSize(12)
      .setFontColor("#666666");
    
    // Apply conditional formatting for Rating KPI background
    if (kpi.title === "Average Rating") {
      const ratingValue = parseFloat(kpi.value);
      const backgroundColor = ratingValue >= 4.5 ? "#4CAF50" : 
                             ratingValue >= 3.5 ? "#FFEB3B" : "#F44336";
      
      sheet.getRange(kpiRow + 1, kpi.column, 1, 2)
        .merge()
        .setBackground(backgroundColor);
    }
    
    // Add border to KPI tile
    tileRange
      .setBorder(true, true, true, true, false, false)
      .setBackground("white");
  });
  
  // Add spacing after KPI tiles
  sheet.setRowHeight(kpiRow + kpiHeight, 15);
  
  // Return the next available row
  return kpiRow + kpiHeight + 1;
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