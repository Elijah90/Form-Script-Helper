// ==================== CONFIGURATION MANAGEMENT ==================== //

/**
 * Get configuration from CONFIG sheet
 * @returns {Object} Configuration object with managerEmail, formUrl, and salesReps
 */
function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('CONFIG');
  
  if (!configSheet) {
    Logger.log('CONFIG sheet not found. Creating one...');
    createConfigSheet();
    return getConfig(); // Recursive call after creating sheet
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

/**
 * Update the form with sales representatives from CONFIG
 */
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

/**
 * Create CONFIG sheet if it doesn't exist
 * @returns {Sheet} The CONFIG sheet
 */
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
    const exampleReps = ['Jarviss', 'Claude', 'Samuel-Scott', 'Christian', 'Lea', 'Paula', 'Meryll', 'Frederick'];
    for (let i = 0; i < exampleReps.length; i++) {
      configSheet.getRange(i + 5, 1).setValue(exampleReps[i]);
    }
    
    // Format the sheet
    configSheet.getRange('A1:A4').setFontWeight('bold');
    configSheet.getRange('A1:B2').setBackground('#e8f0fe');
    configSheet.getRange('A4:A' + (4 + exampleReps.length)).setBackground('#f3f3f3');
    
    // Add instructions
    configSheet.getRange('C1').setValue('← Enter the email address that should receive alerts and reports');
    configSheet.getRange('C2').setValue('← Paste the Google Form URL here to enable automatic updates');
    configSheet.getRange('C4').setValue('← Add or remove sales representatives below (one per row)');
    
    // Auto-resize columns
    configSheet.autoResizeColumns(1, 3);
  }
  
  return configSheet;
}

/**
 * Set up edit trigger for CONFIG sheet
 */
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

/**
 * Function that runs when CONFIG sheet is edited
 * @param {Object} e - The event object
 */
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