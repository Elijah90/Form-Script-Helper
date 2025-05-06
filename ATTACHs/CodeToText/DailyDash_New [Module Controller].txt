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
    
    // Start refresh process
    Logger.log("Starting dashboard refresh...");
    
    try {
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
      
      // Show a toast notification
      ss.toast("Dashboard refreshed successfully!", "Refresh Complete", 3);
      Logger.log("Dashboard refresh completed successfully.");
    } catch (error) {
      // Log any errors
      Logger.log("Error refreshing dashboard: " + error.message);
      ss.toast("Error refreshing dashboard: " + error.message, "Refresh Error", 5);
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
      {name: "Clear All", functionName: "clearDashboard"}
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
    
    // Run the refresh dashboard function
    refreshDashboard();
    
    // Show confirmation
    ss.toast("Dashboard initialized successfully", "Setup Complete", 3);
  }