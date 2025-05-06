// ==================== UTILITY FUNCTIONS ==================== //

/**
 * Create a dashboard sheet if it doesn't exist
 * @param {String} sheetName - Name of the dashboard to create
 * @returns {Sheet} The created or existing sheet
 */
function createDashboardSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log(`Created new sheet: ${sheetName}`);
  }
  
  return sheet;
}

/**
 * Format the Daily Dashboard with proper layout and styling
 * This should be run only once to set up the dashboard
 */
function formatDailyDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = createDashboardSheet('Daily Dashboard');
  
  // Clear any existing content
  sheet.clear();
  
  // Set column widths
  sheet.setColumnWidth(1, 120);  // A
  sheet.setColumnWidth(2, 120);  // B
  sheet.setColumnWidth(3, 120);  // C
  sheet.setColumnWidth(4, 120);  // D
  sheet.setColumnWidth(5, 120);  // E
  sheet.setColumnWidth(6, 120);  // F
  sheet.setColumnWidth(7, 120);  // G
  sheet.setColumnWidth(8, 120);  // H
  
  // Add title and refresh button
  sheet.getRange('A1').setValue('Refresh Data').setFontWeight('bold')
    .setBackground('#4285F4').setFontColor('#ffffff')
    .setBorder(true, true, true, true, false, false, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  
  sheet.getRange('C1:L1').merge().setValue('Daily Performance Dashboard')
    .setFontSize(24).setFontWeight('bold').setHorizontalAlignment('center');
  
  // Add last updated timestamp
  sheet.getRange('B2').setValue('Last updated: Loading...')
    .setFontStyle('italic').setFontColor('#666666');
  
  // Key metrics section
  // Today's Responses
  sheet.getRange('B4:D4').merge().setValue("Today's Responses")
    .setBackground('#E3F2FD').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('B5:D6').merge().setValue('0')
    .setFontSize(36).setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true, true, true, true, false, false, '#90CAF9', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('B4:D6').setBorder(true, true, true, true, false, false, '#BBDEFB', SpreadsheetApp.BorderStyle.SOLID);
  
  // Average Rating
  sheet.getRange('E4:G4').merge().setValue('Average Rating')
    .setBackground('#E8F5E9').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('E5:G6').merge().setValue('0.0')
    .setFontSize(36).setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true, true, true, true, false, false, '#A5D6A7', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('E5:G7').setBorder(true, true, true, true, false, false, '#C8E6C9', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('E7:G7').merge().setValue('No change')
    .setFontStyle('italic').setHorizontalAlignment('center');
  
  // Low Ratings
  sheet.getRange('H4:J4').merge().setValue('Low Ratings (< 3)')
    .setBackground('#FFEBEE').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('H5:J6').merge().setValue('0')
    .setFontSize(36).setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true, true, true, true, false, false, '#FFCDD2', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('H4:J7').setBorder(true, true, true, true, false, false, '#FFCDD2', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('H7:J7').merge().setValue('Need attention')
    .setFontColor('#C62828').setFontStyle('italic').setHorizontalAlignment('center');
  
  // 5-Star Count
  sheet.getRange('K4:M4').merge().setValue('5-Star Count')
    .setBackground('#FFF8E1').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('K5:M6').merge().setValue('0')
    .setFontSize(36).setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true, true, true, true, false, false, '#FFE082', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('K4:M6').setBorder(true, true, true, true, false, false, '#FFECB3', SpreadsheetApp.BorderStyle.SOLID);
  
  // Representative Performances
  sheet.getRange('B10:F10').merge().setValue('Representative Performances')
    .setFontSize(16).setFontWeight('bold');
  
  // Rep table header
  sheet.getRange('B12').setValue('Sales Rep').setFontWeight('bold');
  sheet.getRange('C12').setValue('Responses').setFontWeight('bold');
  sheet.getRange('D12').setValue('Avg. Rating').setFontWeight('bold');
  sheet.getRange('E12').setValue('Low Rating').setFontWeight('bold');
  sheet.getRange('F12').setValue('5 Star Count').setFontWeight('bold');
  sheet.getRange('B12:F12').setBackground('#F5F5F5')
    .setBorder(true, true, true, true, true, true, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);
  
  // Rep table rows
  for (let i = 0; i < 6; i++) {
    sheet.getRange(13 + i, 2, 1, 5).setBorder(true, true, true, true, true, true, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);
  }
  
  // Low Rating Alerts
  sheet.getRange('B22:F22').merge().setValue('Low Rating Alerts')
    .setFontSize(16).setFontWeight('bold');
  
  // Alerts table header
  sheet.getRange('B23').setValue('Time').setFontWeight('bold').setBackground('#FFEBEE');
  sheet.getRange('C23').setValue('Customer').setFontWeight('bold').setBackground('#FFEBEE');
  sheet.getRange('D23').setValue('Rep').setFontWeight('bold').setBackground('#FFEBEE');
  sheet.getRange('E23').setValue('Rating').setFontWeight('bold').setBackground('#FFEBEE');
  sheet.getRange('F23').setValue('Issues').setFontWeight('bold').setBackground('#FFEBEE');
  sheet.getRange('B23:F23')
    .setBorder(true, true, true, true, true, true, '#FFCDD2', SpreadsheetApp.BorderStyle.SOLID);
  
  // Alerts table rows
  for (let i = 0; i < 3; i++) {
    sheet.getRange(24 + i, 2, 1, 5).setBorder(true, true, true, true, true, true, '#FFCDD2', SpreadsheetApp.BorderStyle.SOLID);
  }
  
  // Add script assignment for refresh button
  const script = `function onEdit(e) {
    if (e.range.getA1Notation() === 'A1') {
      manualRefreshDashboard();
    }
  }`;
  
  // Set up the initial empty state
  sheet.getRange('B24').setValue('No low ratings today!');
  sheet.getRange('B24:F24').merge();
  sheet.getRange('B24').setHorizontalAlignment('center');
  
  sheet.getRange('B18').setValue('Others');
  sheet.getRange('C18').setValue(0);
  sheet.getRange('D18').setValue('-');
  sheet.getRange('E18').setValue(0);
  sheet.getRange('F18').setValue(0);
  
  Logger.log('Daily Dashboard formatting completed');
  return sheet;
}

/**
 * Get formatted date string for a given date
 * @param {Date} date - The date to format
 * @returns {String} Formatted date string
 */
function getFormattedDate(date) {
  const timezone = Session.getScriptTimeZone();
  return Utilities.formatDate(date, timezone, "MMM dd, yyyy");
}

/**
 * Get a date range for a specific period
 * @param {String} period - The period type (day, week, month)
 * @returns {Object} Object with startDate and endDate properties
 */
function getDateRange(period) {
  const now = new Date();
  const startDate = new Date();
  
  switch (period.toLowerCase()) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
  }
  
  return {
    startDate: startDate,
    endDate: now
  };
}

/**
 * Function to add a menu when the spreadsheet opens
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