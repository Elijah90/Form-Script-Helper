/**
 * Creates the header section of the CASAMANCE Daily Dashboard
 * Includes title, date, and last updated timestamp
 */
function createDashboardHeader() {
    // Get the DailyDash sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DailyDash');
    
    // Only clear content, NOT formatting (this preserves your background color)
    sheet.getRange("A1:O5").clearContent();
    
    // Set column widths for better layout
    sheet.setColumnWidth(1, 140); // A
    sheet.setColumnWidth(2, 140); // B
    sheet.setColumnWidth(3, 140); // C
    sheet.setColumnWidth(4, 140); // D
    sheet.setColumnWidth(5, 140); // E
    sheet.setColumnWidth(6, 140); // F
    sheet.setColumnWidth(7, 140); // G
    sheet.setColumnWidth(8, 140); // H
    sheet.setColumnWidth(9, 140); // I
    sheet.setColumnWidth(10, 140); // J
    
    // Merge cells for title and set values
    sheet.getRange("A1:E1").merge();
    sheet.getRange("A1").setValue("CASAMANCE Daily Performance Dashboard");
    
    // Get current date and format it
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || "GMT", "MMMM d, yyyy");
    const formattedTime = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || "GMT", "HH:mm");
    
    // Set date and last updated
    sheet.getRange("A2:E2").merge();
    sheet.getRange("A2").setValue(`Date: ${formattedDate} • Last updated: ${formattedTime}`);
    
    // Apply formatting to title
    sheet.getRange("A1").setFontWeight("bold")
                        .setFontSize(18)
                        .setFontColor("#333333");
    
    // Apply formatting to date/time
    sheet.getRange("A2").setFontSize(12)
                        .setFontColor("#666666");
    
    // Add some padding space before KPIs
    sheet.setRowHeight(3, 15);
    
    // Return the next row for continuation
    return 4; // This will be the starting row for KPIs
  }
  
  /**
   * Helper function to format the dashboard background
   * Sets the dashboard's overall appearance
   */
  function formatDashboardBackground() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DailyDash');
    
    // Set overall sheet background color
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
         .setBackground("#f8f9fa");
    
    // Remove gridlines for cleaner look (optional)
    sheet.setHiddenGridlines(true);
  }
  
  /**
   * Test function to verify the header section works correctly
   */
  function testHeaderSection() {
    // Format background first
    formatDashboardBackground();
    
    // Create header and get the next row
    const startRow = createDashboardHeader();
    
    // Log the result
    Logger.log("Header section created. Next row: " + startRow);
  }