// ==================== FORM SUBMISSION HANDLING ==================== //

/**
 * Main form submission handler - triggered when form is submitted
 * @param {Object} e - The form submission event object
 */
function onFormSubmit(e) {
  try {
    Logger.log("Form submitted - starting execution");
    
    // Get configuration
    const config = getConfig();
    
    // Process the form data
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
    
    // Send alert if rating is below 3
    if (!isNaN(rating) && rating < 3) {
      sendLowRatingAlert(rating, repName, config.managerEmail);
    }
    
    // Update Daily Dashboard
    updateDailyDashboard();
    
    Logger.log("Form submission processed successfully");
  } catch (error) {
    Logger.log("Error processing form submission: " + error.toString());
  }
}

/**
 * Extract issues from form response
 * @param {Array} row - The form response row
 * @returns {String} - Concatenated issues with semicolons
 */
function extractIssues(row) {
  // Check columns 5, 7, 9 for feedback text
  const issues = [];
  
  if (row[4]) issues.push(row[4]); // Column 5: "You chose NO, Please share your feedback. (1)"
  if (row[6]) issues.push(row[6]); // Column 7: "You chose NO, Please share your feedback. (2)"
  if (row[8]) issues.push(row[8]); // Column 9: "You chose NO, Please share your feedback. (3)"
  
  return issues.length > 0 ? issues.join('; ') : 'No specific feedback provided';
}

/**
 * Identify the category of feedback issue
 * @param {String} issueText - The feedback text
 * @returns {String} - Category of issue
 */
function categorizeIssue(issueText) {
  if (!issueText || issueText === 'No specific feedback provided') {
    return 'Unspecified';
  }
  
  const lowerIssue = issueText.toLowerCase();
  
  if (lowerIssue.includes('presentation') || lowerIssue.includes('explain')) {
    return 'Presentation Skills';
  } else if (lowerIssue.includes('product') || lowerIssue.includes('knowledge')) {
    return 'Product Knowledge';
  } else if (lowerIssue.includes('deadline') || lowerIssue.includes('time')) {
    return 'Time Management';
  } else if (lowerIssue.includes('attitude') || lowerIssue.includes('rude')) {
    return 'Customer Service';
  } else {
    return 'Other';
  }
}