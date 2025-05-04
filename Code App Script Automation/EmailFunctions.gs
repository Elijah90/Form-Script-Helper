// ==================== EMAIL FUNCTIONS ==================== //

/**
 * Send alert email for low rating
 * @param {Number} rating - The rating value
 * @param {String} repName - The sales representative name
 * @param {String} managerEmail - The manager's email address
 */
function sendLowRatingAlert(rating, repName, managerEmail) {
  Logger.log(`Sending alert for low rating: ${rating}`);
  
  try {
    const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    const emailSubject = "🚨 Low Customer Rating Alert";
    
    // Determine severity based on rating
    let severityIndicator = "";
    let actionNeeded = "";
    
    if (rating === 1) {
      severityIndicator = "⚠️ URGENT: ";
      actionNeeded = "Immediate action required!";
    } else if (rating === 2) {
      severityIndicator = "⚠️ ";
      actionNeeded = "Prompt attention needed.";
    }
    
    const emailBody = `${severityIndicator}A customer just submitted a low rating (${rating} stars).<br><br>
Representative: <strong>${repName}</strong><br><br>
${actionNeeded}<br><br>
<a href="${spreadsheetUrl}">Please review the response in the spreadsheet.</a><br><br>
Timestamp: ${new Date().toString()}`;

    MailApp.sendEmail({
      to: managerEmail,
      subject: emailSubject,
      htmlBody: emailBody,
    });
    
    Logger.log("Email alert sent successfully");
  } catch (error) {
    Logger.log("Error sending email: " + error.toString());
  }
}

/**
 * Daily Summary - Set this to run daily via trigger
 */
function sendDailySummary() {
  const config = getConfig();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  sendPeriodSummary(yesterday, yesterday, "📊 Daily Feedback Summary", "Daily Summary", config.managerEmail);
}

/**
 * Weekly Summary - Set this to run every Friday via trigger
 */
function sendWeeklySummary() {
  const config = getConfig();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);
  sendPeriodSummary(startOfWeek, today, "📈 Weekly Feedback Summary", "Weekly Summary", config.managerEmail);
}

/**
 * Monthly Summary - Set this to run at the end of each month via trigger
 */
function sendMonthlySummary() {
  const config = getConfig();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  sendPeriodSummary(firstDayOfMonth, today, "📅 Monthly Feedback Summary", "Monthly Summary", config.managerEmail);
}

/**
 * Helper function to generate and send summary emails
 * @param {Date} startDate - Start date for the period
 * @param {Date} endDate - End date for the period
 * @param {String} emailSubject - Email subject line
 * @param {String} summaryTitle - Title for the summary
 * @param {String} managerEmail - Manager's email address
 */
function sendPeriodSummary(startDate, endDate, emailSubject, summaryTitle, managerEmail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Form Responses 1');
    
    if (!sheet) {
      Logger.log('Form Responses sheet not found');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Filter rows by date range (skip header row)
    const filteredRows = data.filter((row, index) => {
      if (index === 0) return false;
      if (!row[0]) return false; // Skip if no timestamp
      
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
      
      Logger.log(`Sent empty ${summaryTitle} email`);
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

    // Sort representatives by count (highest first)
    const sortedReps = Object.entries(repCounts)
      .sort((a, b) => b[1] - a[1]);

    // Format representative text
    const repText = sortedReps
      .map(([name, count]) => `- ${name}: ${count}`)
      .join("<br>");

    // Calculate average rating per representative
    const repRatings = {};
    
    filteredRows.forEach(row => {
      const rep = row[COLUMN_REP_NAME - 1];
      const rating = parseInt(row[COLUMN_RATING - 1]);
      
      if (rep && !isNaN(rating)) {
        if (!repRatings[rep]) {
          repRatings[rep] = { sum: 0, count: 0 };
        }
        
        repRatings[rep].sum += rating;
        repRatings[rep].count++;
      }
    });
    
    // Format rep ratings text
    const repRatingsText = Object.entries(repRatings)
      .map(([rep, data]) => {
        const avgRating = (data.sum / data.count).toFixed(2);
        return `- ${rep}: ${avgRating} stars`;
      })
      .join("<br>");

    // Format date range
    const timezone = Session.getScriptTimeZone();
    const startDateStr = Utilities.formatDate(startDate, timezone, "MMM dd, yyyy");
    const endDateStr = Utilities.formatDate(endDate, timezone, "MMM dd, yyyy");
    const dateRangeText = startDateStr === endDateStr ? 
      startDateStr : `${startDateStr} to ${endDateStr}`;

    // Build summary HTML with more formatting and a table
    const htmlBody = `
    <h2>${summaryTitle} (${dateRangeText})</h2>
    
    <p><a href="${ss.getUrl()}">View full data in the spreadsheet</a></p>
    
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr style="background-color: #f2f2f2;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Metric</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Value</th>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Total Responses</td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${filteredRows.length}</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Average Rating</td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${avgNonNull}</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Low Ratings (1-2 stars)</td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${lowRatings > 0 ? `<span style="color: red;">${lowRatings}</span>` : '0'}</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Medium Ratings (3-4 stars)</td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${mediumRatings}</strong></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">High Ratings (5 stars)</td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${highRatings}</strong></td>
      </tr>
    </table>
    
    <h3>Representatives Performance</h3>
    <p>Responses per representative:</p>
    ${repText}
    
    <p>Average rating per representative:</p>
    ${repRatingsText}
    `;

    MailApp.sendEmail({
      to: managerEmail,
      subject: emailSubject,
      htmlBody: htmlBody
    });
    
    Logger.log(`Sent ${summaryTitle} email with ${filteredRows.length} responses`);
  } catch (error) {
    Logger.log("Error generating summary: " + error.toString());
  }
}