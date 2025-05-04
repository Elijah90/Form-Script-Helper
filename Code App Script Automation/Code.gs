// ==================== MAIN SETUP AND TRIGGERS ==================== //

/**
 * Initial setup function - call this once to set up the system
 */
function initialSetup() {
  // Create CONFIG sheet
  createConfigSheet();
  
  // Set up all triggers
  setupTriggers();
  
  // Set up dashboard triggers
  setupDashboardTriggers();
  
  Logger.log('Initial setup completed. Please update the CONFIG sheet with your information.');
}

/**
 * Set up all time-based triggers and form submission trigger
 */
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

/**
 * Function to set up automatic dashboard updates
 */
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
  
  Logger.log('Dashboard triggers set up successfully');
}

/**
 * Add a custom menu to the spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Customer Feedback')
    .addItem('Refresh Dashboard', 'manualRefreshDashboard')
    .addSeparator()
    .addItem('Update Form with Reps', 'updateFormWithConfig')
    .addSeparator()
    .addItem('Run Initial Setup', 'initialSetup')
    .addToUi();
}

/**
 * Function to call when the refresh button is clicked
 */
function manualRefreshDashboard() {
  // Show loading message
  const ui = SpreadsheetApp.getUi();
  
  ui.alert('Refreshing Dashboard...', 'Please wait while the dashboard updates.', ui.ButtonSet.OK);
  
  // Update dashboard
  updateDailyDashboard();
  
  // Show completion message
  ui.alert('Dashboard Updated', 'The dashboard has been refreshed with the latest data.', ui.ButtonSet.OK);
}