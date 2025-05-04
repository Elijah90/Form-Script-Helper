// ==================== CONFIGURATION FROM SHEET ==================== //
// Get configuration from CONFIG sheet
function getConfig() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = ss.getSheetByName('CONFIG');
    
    if (!configSheet) {
      throw new Error('Please create a CONFIG sheet with the required information');
    }
    
    // Get manager email from cell B1
    const managerEmail = configSheet.getRange('B1').getValue();
    
    // Get form URL from cell B2
    const formUrl = configSheet.getRange('B2').getValue();
    
    // Get sales representatives from column A starting at row 5
    const repRange = configSheet.getRange('A5:A' + configSheet.getLastRow());
    const repValues = repRange.getValues();
    const salesReps = repValues
      .filter(row => row[0] !== '') // Remove empty values
      .map(row => row[0]); // Convert to array of strings
    
    return {
      managerEmail: managerEmail,
      formUrl: formUrl,
      salesReps: salesReps
    };
  }
  
  // ==================== UPDATE FORM WITH CONFIG ==================== //
  function updateFormWithConfig() {
    try {
      const config = getConfig();
      
      if (!config.formUrl) {
        Logger.log('No form URL provided in CONFIG sheet');
        return;
      }
      
      // Open the form
      const form = FormApp.openByUrl(config.formUrl);
      
      // Find the "Who attended to you needs" question
      const items = form.getItems();
      let repQuestion = null;
      
      for (let item of items) {
        if (item.getTitle().includes('Who attended to you needs')) {
          repQuestion = item.asListItem();
          break;
        }
      }
      
      if (repQuestion) {
        // Update the choices with current sales reps
        repQuestion.setChoiceValues(config.salesReps);
        Logger.log('Updated form with ' + config.salesReps.length + ' sales representatives');
      } else {
        Logger.log('Could not find the sales representative question in the form');
      }
    } catch (error) {
      Logger.log('Error updating form: ' + error.toString());
    }
  }
  
  // ==================== FORM SUBMISSION TRIGGER ==================== //
  function onFormSubmit(e) {
    const config = getConfig();
    Logger.log("Form submitted - starting execution");
    
    try {
      const values = e.values;
      
      // Column indices (1-based)
      const COLUMN_TIMESTAMP = 1;
      const COLUMN_EMAIL = 2;
      const COLUMN_REP_NAME = 3;
      const COLUMN_RATING = 10;
      
      // Get the rating from the correct column
      const rating = parseInt(values[COLUMN_RATING - 1]);
      
      // Get the rep name from the correct column
      const repName = values[COLUMN_REP_NAME - 1] || "N/A";
      
      Logger.log(`Rating: ${rating}, Rep: ${repName}`);
      
      if (!isNaN(rating) && rating < 3) {
        sendLowRatingAlert(rating, repName, config.managerEmail);
      }
    } catch (error) {
      Logger.log("Error processing form submission: " + error.toString());
    }
      // Adding the data to Daily Dashboard
    updateDailyDashboard();
  }
  
  // Send the low rating alert email
  function sendLowRatingAlert(rating, repName, managerEmail) {
    Logger.log(`Sending alert for low rating: ${rating}`);
    
    try {
      const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
      const emailSubject = "🚨 Low Customer Rating Alert";
      const emailBody = `⚠️ A customer just submitted a low rating (${rating} stars).<br><br>
  
  Representative: ${repName}<br>
  
  <a href="${spreadsheetUrl}">Please review the response in the spreadsheet.</a><br><br>
  
  Timestamp: ${new Date().toString()}`;
  
      MailApp.sendEmail({
        to: managerEmail,
        subject: emailSubject,
        htmlBody: emailBody,
      });
      
      Logger.log("Email sent successfully");
    } catch (error) {
      Logger.log("Error sending email: " + error.toString());
    }
  }
  
  // ==================== SUMMARY REPORTS ==================== //
  
  // Daily Summary - Set this to run daily via trigger
  function sendDailySummary() {
    const config = getConfig();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    sendPeriodSummary(yesterday, yesterday, "📊 Daily Feedback Summary", "Daily Summary", config.managerEmail);
  }
  
  // Weekly Summary - Set this to run every Friday via trigger
  function sendWeeklySummary() {
    const config = getConfig();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    sendPeriodSummary(startOfWeek, today, "📈 Weekly Feedback Summary", "Weekly Summary", config.managerEmail);
  }
  
  // Monthly Summary - Set this to run at the end of each month via trigger
  function sendMonthlySummary() {
    const config = getConfig();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    sendPeriodSummary(firstDayOfMonth, today, "📅 Monthly Feedback Summary", "Monthly Summary", config.managerEmail);
  }
  
  // Helper function to generate and send summary emails
  function sendPeriodSummary(startDate, endDate, emailSubject, summaryTitle, managerEmail) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('Form Responses 1');
      const data = sheet.getDataRange().getValues();
      
      // Filter rows by date range (skip header row)
      const filteredRows = data.filter((row, index) => {
        if (index === 0) return false;
        const rowDate = new Date(row[0]); // First column is timestamp
        return rowDate >= startDate && rowDate <= endDate;
      });
      
      // Generate summary with proper HTML formatting
      if (filteredRows.length === 0) {
        const htmlBody = `${summaryTitle} 📋<br><br>
  No responses recorded during this period.<br><br>
  <a href="${ss.getUrl()}">Please review the full data in the spreadsheet.</a>`;
        
        MailApp.sendEmail({
          to: managerEmail,
          subject: emailSubject,
          htmlBody: htmlBody
        });
        return;
      }
  
      // Column indices
      const COLUMN_RATING = 10;
      const COLUMN_REP_NAME = 3;
  
      // Get rating values from the correct column
      const allRatings = filteredRows.map(row => {
        const rating = parseInt(row[COLUMN_RATING - 1]);
        return rating;
      });
  
      // For average with null answers (treats NaN as 0)
      const ratingsWithNull = allRatings.map(rating => 
        isNaN(rating) ? 0 : rating
      );
  
      // For average without null answers
      const ratingsNonNull = allRatings.filter(rating => 
        !isNaN(rating) && rating > 0
      );
      
      // Get rep names from the correct column
      const reps = filteredRows.map(row => row[COLUMN_REP_NAME - 1]);
      
      // Calculate statistics for both averages
      const avgWithNull = ratingsWithNull.length > 0 ? 
        (ratingsWithNull.reduce((a, b) => a + b, 0) / ratingsWithNull.length).toFixed(2) : "N/A";
  
      const avgNonNull = ratingsNonNull.length > 0 ? 
        (ratingsNonNull.reduce((a, b) => a + b, 0) / ratingsNonNull.length).toFixed(2) : "N/A";
        
      // Calculate rating counts
      const lowRatings = ratingsNonNull.filter(r => r < 3).length;
      const mediumRatings = ratingsNonNull.filter(r => r >= 3 && r <= 4).length;
      const highRatings = ratingsNonNull.filter(r => r === 5).length;
  
      // Count responses per representative
      const repCounts = reps.reduce((acc, name) => {
        if (!name) return acc;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});
  
      // Format representative text
      const repText = Object.entries(repCounts)
        .map(([name, count]) => `- ${name}: ${count}`)
        .join("<br>");
  
      // Build summary HTML
      const htmlBody = `${summaryTitle} 📋<br><br>
  <a href="${ss.getUrl()}">Please review the full data in the spreadsheet.</a><br><br>
  Total Responses: ${filteredRows.length}<br>
  Average Rating (with null answers): ${avgWithNull}<br>
  Average Rating (non-null): ${avgNonNull}<br>
  Low Ratings (less than 3 stars): ${lowRatings > 0 ? `<span style="color: red;">${lowRatings}</span>` : lowRatings}<br>
  Medium Ratings (3 or 4 stars): ${mediumRatings}<br>
  High Ratings (5 stars): ${highRatings}<br><br>
  Representatives Mentioned:<br>
  ${repText}`;
  
      MailApp.sendEmail({
        to: managerEmail,
        subject: emailSubject,
        htmlBody: htmlBody
      });
    } catch (error) {
      Logger.log("Error generating summary: " + error.toString());
    }
  }
  
  // ==================== CONFIG MANAGEMENT ==================== //
  
  // Create CONFIG sheet if it doesn't exist
  function createConfigSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let configSheet = ss.getSheetByName('CONFIG');
    
    if (!configSheet) {
      configSheet = ss.insertSheet('CONFIG');
      
      // Set up headers
      configSheet.getRange('A1').setValue('Manager Email');
      configSheet.getRange('A2').setValue('Form URL');
      configSheet.getRange('A4').setValue('Sales Representatives');
      
      // Set default values
      configSheet.getRange('B1').setValue('your-email@example.com');
      configSheet.getRange('B2').setValue('Paste your Google Form URL here');
      
      // Add example representatives
      const exampleReps = ['Jarviss', 'Claude', 'Samuel-Scott', 'Christian', 'Lea', 'Paula'];
      for (let i = 0; i < exampleReps.length; i++) {
        configSheet.getRange(i + 5, 1).setValue(exampleReps[i]);
      }
      
      // Format the sheet
      configSheet.getRange('A1:A4').setFontWeight('bold');
      configSheet.getRange('A1:B2').setBackground('#e8f0fe');
      configSheet.getRange('A4:A' + (4 + exampleReps.length)).setBackground('#f3f3f3');
    }
    
    return configSheet;
  }
  
  // ==================== SETUP TRIGGERS ==================== //
  
  // Set up time-based triggers
  function setupTriggers() {
    // Remove existing triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // Create form submit trigger
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    
    // Create daily summary trigger (runs at 7 AM)
    ScriptApp.newTrigger('sendDailySummary')
      .timeBased()
      .atHour(7)
      .everyDays(1)
      .create();
    
    // Create weekly summary trigger (runs every Friday at 5 PM)
    ScriptApp.newTrigger('sendWeeklySummary')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.FRIDAY)
      .atHour(17)
      .create();
    
    // Create monthly summary trigger (runs last day of month at 11 PM)
    ScriptApp.newTrigger('sendMonthlySummary')
      .timeBased()
      .onMonthDay(28) // Run on 28th to ensure it always runs
      .atHour(23)
      .create();
    
    Logger.log('All triggers set up successfully');
  }
  
  // Initial setup function
  function initialSetup() {
    createConfigSheet();
    setupTriggers();
    setupEditTrigger(); // Add this line
    Logger.log('Initial setup completed. Please update the CONFIG sheet with your information.');
  }
  
  // ==================== AUTO-UPDATE FORM ON CONFIG CHANGE ==================== //
  function setupEditTrigger() {
    // Create an edit trigger for the CONFIG sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Remove any existing edit triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getEventType() === ScriptApp.EventType.ON_EDIT) {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new edit trigger
    ScriptApp.newTrigger('onConfigEdit')
      .forSpreadsheet(ss)
      .onEdit()
      .create();
      
    Logger.log('Edit trigger created successfully');
  }
  
  // Function that runs when CONFIG sheet is edited
  function onConfigEdit(e) {
    // Check if the edit was made in the CONFIG sheet
    const sheet = e.source.getActiveSheet();
    if (sheet.getName() !== 'CONFIG') {
      return; // Exit if not CONFIG sheet
    }
    
    // Check if the edit was made in the sales reps column (column A)
    const range = e.range;
    if (range.getColumn() === 1 && range.getRow() >= 5) {
      // A change was made to the sales reps list
      Logger.log('Sales rep list changed, updating form...');
      updateFormWithConfig();
    }
  }
  
  // ==================== DAILY DASHBOARD UPDATE FUNCTIONS ==================== //
  
  // Main function to update the Daily Dashboard
  function updateDailyDashboard() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const dashboardSheet = ss.getSheetByName('Daily Dashboard');
      const dataSheet = ss.getSheetByName('Form Responses 1');
      
      if (!dashboardSheet || !dataSheet) {
        Logger.log('Required sheets not found');
        return;
      }
      
      // Get today's data
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
      
      // Get all responses and filter for today
      const allData = dataSheet.getDataRange().getValues();
      const headers = allData[0];
      const todayData = allData.slice(1).filter(row => {
        const timestamp = new Date(row[0]);
        return timestamp >= today && timestamp < tomorrow;
      });
      
      // Update timestamp
      updateTimestamp(dashboardSheet);
      
      // Update key metrics
      updateKeyMetrics(dashboardSheet, todayData);
      
      // Update representative performance table
      updateRepresentativeTable(dashboardSheet, todayData);
      
      // Update low rating alerts
      updateLowRatingAlerts(dashboardSheet, todayData);
      
      Logger.log('Daily Dashboard updated successfully');
    } catch (error) {
      Logger.log('Error updating dashboard: ' + error.toString());
    }
  }
  
  // Update the "Last updated" timestamp
  function updateTimestamp(sheet) {
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "MMM dd, yyyy hh:mm a");
    sheet.getRange('A2').setValue('Last updated: ' + formattedDate);
  }
  
  // Update key metrics cards
  function updateKeyMetrics(sheet, todayData) {
    // Calculate metrics
    const totalResponses = todayData.length;
    
    // Get ratings from column 10 (index 9)
    const ratings = todayData.map(row => parseInt(row[9])).filter(r => !isNaN(r));
    const avgRating = ratings.length > 0 ? 
      (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0.0";
    
    const lowRatings = ratings.filter(r => r < 3).length;
    const fiveStarCount = ratings.filter(r => r === 5).length;
    
    // Get yesterday's average for trend
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayData = dataSheet.getDataRange().getValues().slice(1).filter(row => {
      const timestamp = new Date(row[0]);
      return timestamp >= yesterday && timestamp < new Date(yesterday.getTime() + 86400000);
    });
    
    const yesterdayRatings = yesterdayData.map(row => parseInt(row[9])).filter(r => !isNaN(r));
    const yesterdayAvg = yesterdayRatings.length > 0 ? 
      (yesterdayRatings.reduce((a, b) => a + b, 0) / yesterdayRatings.length).toFixed(1) : "0.0";
    
    const trend = (parseFloat(avgRating) - parseFloat(yesterdayAvg)).toFixed(1);
    const trendText = trend >= 0 ? `↑ ${trend} from yesterday` : `↓ ${Math.abs(trend)} from yesterday`;
    
    // Update cells
    sheet.getRange('B5').setValue(totalResponses);
    sheet.getRange('D5').setValue(avgRating);
    sheet.getRange('D7').setValue(trendText);
    sheet.getRange('F5').setValue(lowRatings);
    sheet.getRange('H5').setValue(fiveStarCount);
    
    // Update trend color
    sheet.getRange('D7').setFontColor(trend >= 0 ? '#2E7D32' : '#C62828');
  }
  
  // Update representative performance table
  function updateRepresentativeTable(sheet, todayData) {
    // Clear existing data (keep formatting)
    sheet.getRange('B13:F18').clearContent();
    
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
    sortedReps.forEach(([rep, data]) => {
      if (row <= 17) { // Limit to 5 reps
        const avgRating = data.ratings.length > 0 ? 
          (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1) : "-";
        
        sheet.getRange(row, 2).setValue(rep); // Column B
        sheet.getRange(row, 3).setValue(data.responses); // Column C
        sheet.getRange(row, 4).setValue(avgRating); // Column D
        sheet.getRange(row, 5).setValue(data.lowRatings); // Column E
        sheet.getRange(row, 6).setValue(data.fiveStars); // Column F
        
        // Color code low ratings
        if (data.lowRatings > 0) {
          sheet.getRange(row, 5).setFontColor('#C62828');
        }
        
        row++;
      }
    });
    
    // Update "Others" row if needed
    const othersData = sortedReps.slice(5).reduce((acc, [rep, data]) => {
      acc.responses += data.responses;
      acc.lowRatings += data.lowRatings;
      acc.fiveStars += data.fiveStars;
      return acc;
    }, { responses: 0, lowRatings: 0, fiveStars: 0 });
    
    if (othersData.responses > 0) {
      sheet.getRange(18, 2).setValue('Others');
      sheet.getRange(18, 3).setValue(othersData.responses);
      sheet.getRange(18, 4).setValue('-');
      sheet.getRange(18, 5).setValue(othersData.lowRatings);
      sheet.getRange(18, 6).setValue(othersData.fiveStars);
    }
  }
  
  // Update low rating alerts table
  function updateLowRatingAlerts(sheet, todayData) {
    // Clear existing alerts
    sheet.getRange('B24:F26').clearContent();
    
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
      .sort((a, b) => a.time - b.time);
    
    // Fill alerts table
    for (let i = 0; i < Math.min(lowRatingData.length, 3); i++) {
      const alert = lowRatingData[i];
      const rowNum = 24 + i;
      
      const timeStr = Utilities.formatDate(alert.time, Session.getScriptTimeZone(), "h:mm a");
      
      sheet.getRange(rowNum, 2).setValue(timeStr); // Column B
      sheet.getRange(rowNum, 3).setValue(alert.customer); // Column C
      sheet.getRange(rowNum, 4).setValue(alert.rep); // Column D
      sheet.getRange(rowNum, 5).setValue(alert.rating); // Column E
      sheet.getRange(rowNum, 6).setValue(alert.issues); // Column F
    }
    
    // If no low ratings, show message
    if (lowRatingData.length === 0) {
      sheet.getRange('B24').setValue('No low ratings today!');
      sheet.getRange('B24:F24').merge();
      sheet.getRange('B24').setHorizontalAlignment('center');
    }
  }
  
  // Extract issues from form responses
  function extractIssues(row) {
    // Check columns 5, 7, 9 for feedback text
    const issues = [];
    
    if (row[4]) issues.push(row[4]); // Column 5: "You chose NO, Please share your feedback. (1)"
    if (row[6]) issues.push(row[6]); // Column 7: "You chose NO, Please share your feedback. (2)"
    if (row[8]) issues.push(row[8]); // Column 9: "You chose NO, Please share your feedback. (3)"
    
    return issues.length > 0 ? issues.join('; ') : 'No specific feedback provided';
  }
  
  // ==================== MANUAL REFRESH BUTTON ==================== //
  
  // Function to call when the refresh button is clicked
  function manualRefreshDashboard() {
    // Show loading message
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    
    ui.alert('Refreshing Dashboard...', 'Please wait while the dashboard updates.', ui.ButtonSet.OK);
    
    // Update dashboard
    updateDailyDashboard();
    
    // Show completion message
    ui.alert('Dashboard Updated', 'The dashboard has been refreshed with the latest data.', ui.ButtonSet.OK);
  }
  
  // ==================== AUTOMATIC UPDATES ==================== //
  
  // Function to set up automatic updates (call this from the initialSetup function)
  function setupDashboardTriggers() {
    // Remove existing dashboard triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'updateDailyDashboard') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create trigger to update dashboard every hour
    ScriptApp.newTrigger('updateDailyDashboard')
      .timeBased()
      .everyHours(1)
      .create();
    
    // Create trigger to reset dashboard at midnight
    ScriptApp.newTrigger('resetDailyDashboard')
      .timeBased()
      .atHour(0)
      .everyDays(1)
      .create();
  }
  
  // Function to reset the dashboard at midnight
  function resetDailyDashboard() {
    // Clear all data and update with empty values
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dashboardSheet = ss.getSheetByName('Daily Dashboard');
    
    if (!dashboardSheet) return;
    
    // Clear data ranges
    dashboardSheet.getRange('B5').setValue(0);
    dashboardSheet.getRange('D5').setValue("0.0");
    dashboardSheet.getRange('D7').setValue("No change");
    dashboardSheet.getRange('F5').setValue(0);
    dashboardSheet.getRange('H5').setValue(0);
    
    // Clear tables
    dashboardSheet.getRange('B13:F18').clearContent();
    dashboardSheet.getRange('B24:F26').clearContent();
    
    // Update timestamp
    updateTimestamp(dashboardSheet);
  }
  
  // ==================== INTEGRATION WITH EXISTING SCRIPT ==================== //
  
  // Add this to your existing onFormSubmit function
  function onFormSubmitWithDashboard(e) {
    // Run the existing form submission handling
    onFormSubmit(e);
    
    // Update the daily dashboard
    updateDailyDashboard();
  }