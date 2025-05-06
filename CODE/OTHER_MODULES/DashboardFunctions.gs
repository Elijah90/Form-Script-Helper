// ==================== DAILY DASHBOARD FUNCTIONS ==================== //

/**
 * Main function to update the Daily Dashboard
 */
function updateDailyDashboard() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dashboardSheet = ss.getSheetByName('Daily Dashboard');
    const dataSheet = ss.getSheetByName('Form Responses 1');
    
    if (!dashboardSheet) {
      Logger.log('Daily Dashboard sheet not found');
      return;
    }
    
    if (!dataSheet) {
      Logger.log('Form Responses sheet not found');
      return;
    }
    
    // Get today's data
    const todayData = getTodayData(dataSheet);
    
    // Update timestamp
    updateTimestamp(dashboardSheet);
    
    // Update key metrics
    updateKeyMetrics(dashboardSheet, dataSheet, todayData);
    
    // Update representative performance table
    updateRepresentativeTable(dashboardSheet, todayData);
    
    // Update low rating alerts
    updateLowRatingAlerts(dashboardSheet, todayData);
    
    Logger.log('Daily Dashboard updated successfully');
  } catch (error) {
    Logger.log('Error updating dashboard: ' + error.toString());
  }
}

/**
 * Get today's data from the form responses
 * @param {Sheet} dataSheet - The sheet containing form responses
 * @returns {Array} - Array of today's data rows
 */
function getTodayData(dataSheet) {
  // Define today in the script's timezone
  const timezone = Session.getScriptTimeZone();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
  
  // Get all responses and filter for today
  const allData = dataSheet.getDataRange().getValues();
  const headers = allData[0]; // Store headers
  
  // Filter data for today (exclude headers)
  const todayData = allData.slice(1).filter(row => {
    if (!row[0]) return false; // Skip if no timestamp
    
    const timestamp = new Date(row[0]);
    return timestamp >= today && timestamp < tomorrow;
  });
  
  Logger.log(`Found ${todayData.length} responses for today`);
  return todayData;
}

/**
 * Update the "Last updated" timestamp
 * @param {Sheet} sheet - The dashboard sheet
 */
function updateTimestamp(sheet) {
  const now = new Date();
  const timezone = Session.getScriptTimeZone();
  const formattedDate = Utilities.formatDate(now, timezone, "MMM dd, yyyy h:mm a");
  sheet.getRange('A2').setValue('Last updated: ' + formattedDate);
}

/**
 * Update key metrics cards
 * @param {Sheet} sheet - The dashboard sheet
 * @param {Sheet} dataSheet - The data sheet with all responses
 * @param {Array} todayData - Today's data rows
 */
function updateKeyMetrics(sheet, dataSheet, todayData) {
  // Calculate metrics
  const totalResponses = todayData.length;
  
  // Get ratings from column 10 (index 9)
  const ratings = todayData.map(row => parseInt(row[9])).filter(r => !isNaN(r));
  const avgRating = ratings.length > 0 ? 
    (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0.0";
  
  const lowRatings = ratings.filter(r => r < 3).length;
  const fiveStarCount = ratings.filter(r => r === 5).length;
  
  // Get yesterday's data and average
  const timezone = Session.getScriptTimeZone();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all data and filter for yesterday
  const allData = dataSheet.getDataRange().getValues();
  
  const yesterdayData = allData.slice(1).filter(row => {
    if (!row[0]) return false; // Skip if no timestamp
    
    const timestamp = new Date(row[0]);
    return timestamp >= yesterday && timestamp < today;
  });
  
  const yesterdayRatings = yesterdayData.map(row => parseInt(row[9])).filter(r => !isNaN(r));
  const yesterdayAvg = yesterdayRatings.length > 0 ? 
    (yesterdayRatings.reduce((a, b) => a + b, 0) / yesterdayRatings.length).toFixed(1) : "0.0";
  
  const trend = (parseFloat(avgRating) - parseFloat(yesterdayAvg)).toFixed(1);
  const trendText = trend >= 0 ? `↑ ${trend} from yesterday` : `↓ ${Math.abs(trend)} from yesterday`;
  
  // Update cells
  sheet.getRange('B5').setValue(totalResponses);
  sheet.getRange('F5').setValue(avgRating);
  sheet.getRange('F7').setValue(trendText);
  sheet.getRange('J5').setValue(lowRatings);
  sheet.getRange('N5').setValue(fiveStarCount);
  
  // Update trend color
  sheet.getRange('D7').setFontColor(trend >= 0 ? '#2E7D32' : '#C62828');
}

/**
 * Update representative performance table
 * @param {Sheet} sheet - The dashboard sheet
 * @param {Array} todayData - Today's data rows
 */
function updateRepresentativeTable(sheet, todayData) {
  // Clear existing data (keep formatting)
  sheet.getRange('B13:B18').clearContent(); // Sales Rep column
  sheet.getRange('F13:F18').clearContent(); // Responses column
  sheet.getRange('H13:H18').clearContent(); // Avg. Rating column
  sheet.getRange('K13:K18').clearContent(); // Low Rating column
  sheet.getRange('N13:N18').clearContent(); // 5 Star Count column
  
  // If no data for today, display a message
  if (todayData.length === 0) {
    sheet.getRange('B13').setValue('No data available today');
    sheet.getRange('B13:N13').merge();
    sheet.getRange('B13').setHorizontalAlignment('center');
    sheet.getRange('B13').setFontStyle('italic');
    return;
  } else {
    // Unmerge if previously merged
    try {
      sheet.getRange('B13:N13').breakApart();
    } catch (e) {
      // Already unmerged, continue
    }
  }
  
  // Create rep performance data
  const repData = {};
  const config = getConfig();
  
  // Initialize all reps with zero values
  config.salesReps.forEach(rep => {
    repData[rep] = {
      responses: 0,
      ratings: [],
      lowRatings: 0,
      fiveStars: 0
    };
  });
  
  // Process today's data
  todayData.forEach(row => {
    const rep = row[2]; // Column 3 (index 2) is rep name
    const rating = parseInt(row[9]); // Column 10 (index 9) is rating
    
    if (rep && !isNaN(rating)) {
      if (!repData[rep]) {
        repData[rep] = { responses: 0, ratings: [], lowRatings: 0, fiveStars: 0 };
      }
      
      repData[rep].responses++;
      repData[rep].ratings.push(rating);
      if (rating < 3) repData[rep].lowRatings++;
      if (rating === 5) repData[rep].fiveStars++;
    }
  });
  
  // Sort reps by number of responses (highest first)
  const sortedReps = Object.entries(repData)
    .filter(([rep, data]) => data.responses > 0)
    .sort((a, b) => b[1].responses - a[1].responses);
  
  // Fill in the table
  let row = 13;
  const displayReps = sortedReps.slice(0, 5); // Top 5 reps
  
  displayReps.forEach(([rep, data]) => {
    const avgRating = data.ratings.length > 0 ? 
      (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1) : "-";
    
    sheet.getRange(row, 2).setValue(rep); // Column B (Sales Rep)
    sheet.getRange(row, 6).setValue(data.responses); // Column F (Responses)
    sheet.getRange(row, 8).setValue(avgRating); // Column H (Avg. Rating)
    sheet.getRange(row, 11).setValue(data.lowRatings); // Column K (Low Rating)
    sheet.getRange(row, 14).setValue(data.fiveStars); // Column N (5 Star Count)
    
    // Color code low ratings
    if (data.lowRatings > 0) {
      sheet.getRange(row, 11).setFontColor('#C62828');
    }
    
    row++;
  });
  
  // Calculate "Others" row data (reps beyond the top 5)
  const othersData = sortedReps.slice(5).reduce((acc, [rep, data]) => {
    acc.responses += data.responses;
    acc.lowRatings += data.lowRatings;
    acc.fiveStars += data.fiveStars;
    acc.allRatings = acc.allRatings.concat(data.ratings);
    return acc;
  }, { responses: 0, lowRatings: 0, fiveStars: 0, allRatings: [] });
  
  // Update "Others" row if there are any additional reps with data
  if (othersData.responses > 0) {
    const othersAvgRating = othersData.allRatings.length > 0 ? 
      (othersData.allRatings.reduce((a, b) => a + b, 0) / othersData.allRatings.length).toFixed(1) : "-";
    
    sheet.getRange(18, 2).setValue('Others');
    sheet.getRange(18, 6).setValue(othersData.responses);
    sheet.getRange(18, 8).setValue(othersAvgRating);
    sheet.getRange(18, 11).setValue(othersData.lowRatings);
    sheet.getRange(18, 14).setValue(othersData.fiveStars);
    
    // Color code low ratings
    if (othersData.lowRatings > 0) {
      sheet.getRange(18, 11).setFontColor('#C62828');
    }
  } else {
    // Always show "Others" row with zeros
    sheet.getRange(18, 2).setValue('Others');
    sheet.getRange(18, 6).setValue(0);
    sheet.getRange(18, 8).setValue('-');
    sheet.getRange(18, 11).setValue(0);
    sheet.getRange(18, 14).setValue(0);
  }
}

/**
 * Update low rating alerts table
 * @param {Sheet} sheet - The dashboard sheet
 * @param {Array} todayData - Today's data rows
 */
function updateLowRatingAlerts(sheet, todayData) {
  // Clear existing alerts
  sheet.getRange('B24:B26').clearContent(); // Time column
  sheet.getRange('D24:D26').clearContent(); // Customer column
  sheet.getRange('G24:G26').clearContent(); // Rep column
  sheet.getRange('I24:I26').clearContent(); // Rating column
  sheet.getRange('L24:L26').clearContent(); // Issues column
  
  // Find low ratings
  const lowRatingData = todayData
    .filter(row => parseInt(row[9]) < 3)
    .map(row => ({
      time: new Date(row[0]),
      customer: row[1],
      rep: row[2],
      rating: parseInt(row[9]),
      issues: extractIssues(row)
    }))
    .sort((a, b) => b.time - a.time); // Most recent first
  
  // If no low ratings, show message
  if (lowRatingData.length === 0) {
    sheet.getRange('B24').setValue('No low ratings today!');
    // Don't merge - this can cause issues with the table structure
    sheet.getRange('B24').setHorizontalAlignment('center');
    sheet.getRange('B24').setFontColor('#2E7D32'); // Green color
    return;
  }
  
  // Fill alerts table (up to 3 entries)
  for (let i = 0; i < Math.min(lowRatingData.length, 3); i++) {
    const alert = lowRatingData[i];
    const rowNum = 24 + i;
    
    const timezone = Session.getScriptTimeZone();
    const timeStr = Utilities.formatDate(alert.time, timezone, "h:mm a");
    
    sheet.getRange(rowNum, 2).setValue(timeStr); // Column B (Time)
    sheet.getRange(rowNum, 4).setValue(alert.customer); // Column D (Customer)
    sheet.getRange(rowNum, 7).setValue(alert.rep); // Column G (Rep)
    sheet.getRange(rowNum, 9).setValue(alert.rating); // Column I (Rating)
    sheet.getRange(rowNum, 12).setValue(alert.issues); // Column L (Issues)
    
    // Set background color for the row based on rating
    const color = alert.rating === 1 ? '#ffebee' : '#fff8e1'; // Red for 1-star, amber for 2-star
    sheet.getRange(rowNum, 2, 1, 17).setBackground(color);
  }
}

/**
 * Function to reset the dashboard at midnight
 */
function resetDailyDashboard() {
  // Clear all data and update with empty values
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName('Daily Dashboard');
  
  if (!dashboardSheet) {
    Logger.log('Daily Dashboard sheet not found');
    return;
  }
  
  // Clear data ranges
  dashboardSheet.getRange('B5').setValue(0);
  dashboardSheet.getRange('F5').setValue("0.0");
  dashboardSheet.getRange('F7').setValue("No change");
  dashboardSheet.getRange('J5').setValue(0);
  dashboardSheet.getRange('N5').setValue(0);
  
  // Clear tables
  dashboardSheet.getRange('B13:B18').clearContent();
  dashboardSheet.getRange('F13:F18').clearContent();
  dashboardSheet.getRange('H13:H18').clearContent();
  dashboardSheet.getRange('K13:K18').clearContent();
  dashboardSheet.getRange('N13:N18').clearContent();
  
  dashboardSheet.getRange('B24:B26').clearContent();
  dashboardSheet.getRange('D24:D26').clearContent();
  dashboardSheet.getRange('G24:G26').clearContent();
  dashboardSheet.getRange('I24:I26').clearContent();
  dashboardSheet.getRange('L24:L26').clearContent();
  
  // Reset "Others" row
  dashboardSheet.getRange(18, 2).setValue('Others');
  dashboardSheet.getRange(18, 6).setValue(0);
  dashboardSheet.getRange(18, 8).setValue('-');
  dashboardSheet.getRange(18, 11).setValue(0);
  dashboardSheet.getRange(18, 14).setValue(0);
  
  // Add "No low ratings" message
  dashboardSheet.getRange('B24').setValue('No low ratings today!');
  dashboardSheet.getRange('B24').setHorizontalAlignment('center');
  dashboardSheet.getRange('B24').setFontColor('#2E7D32'); // Green color
  
  // Update timestamp
  updateTimestamp(dashboardSheet);
  
  Logger.log('Daily Dashboard reset for a new day');
}