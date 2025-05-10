/**
 * Data Processing Module for Representative Performance
 * 
 * This module aggregates form response data and calculates
 * metrics for the Representative Performance table
 */

/**
 * Gets all representative performance data
 * @param {string} dataSheetName - Name of the data source sheet
 * @return {Array} Array of representative performance objects
 */
function getRepPerformanceData(dataSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(dataSheetName);
  
  if (!dataSheet) {
    Logger.log(`Error: Data sheet "${dataSheetName}" not found`);
    return [];
  }
  
  // Get all data
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indexes
  const colIndexes = {
    timestamp: headers.indexOf("Timestamp"),
    email: headers.indexOf("Email Address"),
    repName: headers.findIndex(header => 
      header.includes("Who attended to you needs") || 
      header.includes("Who attended to your needs")
    ),
    needMet: headers.findIndex(header => 
      header.includes("Has your need been met") ||
      header.includes("need been met")
    ),
    satisfaction: headers.findIndex(header => 
      header.includes("satisfied with the Rep's presentation") ||
      header.includes("satisfaction")
    ),
    rating: headers.findIndex(header => 
      header.includes("rate our services") || 
      header.includes("1 to 5 stars") ||
      header.includes("scale of 1 to 5")
    )
  };
  
  // Fallback for rating column
  if (colIndexes.rating === -1) {
    colIndexes.rating = headers.length - 1;
    Logger.log("Warning: Using last column as rating column");
  }
  
  // Process data
  const responses = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[colIndexes.timestamp]) continue;
    
    responses.push({
      timestamp: new Date(row[colIndexes.timestamp]),
      email: row[colIndexes.email],
      repName: row[colIndexes.repName],
      needMet: row[colIndexes.needMet],
      satisfaction: row[colIndexes.satisfaction],
      rating: parseFloat(row[colIndexes.rating]) || 0
    });
  }
  
  // Aggregate by representative
  return aggregateByRep(responses);
}

/**
 * Aggregates response data by representative
 * @param {Array} responses - Array of response objects
 * @return {Array} Array of representative performance objects
 */
function aggregateByRep(responses) {
  const repData = {};
  const today = new Date();
  const todayString = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  
  // Group responses by rep
  responses.forEach(response => {
    const repName = response.repName || "Unknown";
    
    if (!repData[repName]) {
      repData[repName] = {
        repName: repName,
        responses: [],
        ratings: [],
        fiveStarsToday: 0,
        fiveStarsTotal: 0,
        negatives: 0
      };
    }
    
    repData[repName].responses.push(response);
    repData[repName].ratings.push(response.rating);
    
    // Count 5-star ratings
    if (response.rating === 5) {
      repData[repName].fiveStarsTotal++;
      
      // Check if it's from today
      const responseDate = Utilities.formatDate(response.timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd");
      if (responseDate === todayString) {
        repData[repName].fiveStarsToday++;
      }
    }
    
    // Count negative ratings (1-2 stars)
    if (response.rating <= 2) {
      repData[repName].negatives++;
    }
  });
  
  // Calculate metrics for each rep
  const repArray = Object.values(repData).map(rep => calculateMetrics(rep));
  
  // Sort by average rating (descending)
  return repArray.sort((a, b) => b.avgRating - a.avgRating);
}

/**
 * Calculates performance metrics for a representative
 * @param {Object} repData - Representative data object
 * @return {Object} Enhanced rep object with calculated metrics
 */
function calculateMetrics(repData) {
  const totalResponses = repData.responses.length;
  
  // Calculate average rating
  const avgRating = totalResponses > 0 ? 
    repData.ratings.reduce((sum, rating) => sum + rating, 0) / totalResponses : 0;
  
  // Determine milestone progress
  const milestoneProgress = calculateMilestoneProgress(repData.fiveStarsTotal);
  
  // Calculate reward due (£250 per 5 five-star ratings)
  const rewardDue = Math.floor(repData.fiveStarsTotal / 5) * 250;
  
  // Determine performance level
  const performanceLevel = determinePerformanceLevel(avgRating);
  
  return {
    repName: repData.repName,
    totalResponses: totalResponses,
    avgRating: avgRating,
    fiveStarsToday: repData.fiveStarsToday,
    fiveStarsTotal: repData.fiveStarsTotal,
    negatives: repData.negatives,
    milestoneProgress: milestoneProgress,
    rewardDue: rewardDue,
    performanceLevel: performanceLevel
  };
}

/**
 * Calculates milestone progress for a representative
 * @param {number} fiveStarCount - Current count of 5-star ratings
 * @return {Object} Milestone progress object
 */
function calculateMilestoneProgress(fiveStarCount) {
  // Milestones at 10, 15, and 20
  const milestones = [10, 15, 20];
  
  // Find the next milestone
  let nextMilestone = milestones.find(m => m > fiveStarCount);
  if (!nextMilestone) {
    // If beyond highest milestone, use increment of 5
    nextMilestone = Math.ceil(fiveStarCount / 5) * 5 + 5;
  }
  
  // Find the previous milestone
  let previousMilestone = 0;
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i] <= fiveStarCount) {
      previousMilestone = milestones[i];
      break;
    }
  }
  
  // If count is higher than highest defined milestone
  if (fiveStarCount >= milestones[milestones.length - 1]) {
    previousMilestone = Math.floor(fiveStarCount / 5) * 5;
  }
  
  // Calculate percentage progress
  const range = nextMilestone - previousMilestone;
  const progress = fiveStarCount - previousMilestone;
  const percentage = range > 0 ? (progress / range) * 100 : 0;
  
  return {
    current: fiveStarCount,
    target: nextMilestone,
    percentage: percentage,
    progressText: `${fiveStarCount}/${nextMilestone} ★`
  };
}

/**
 * Determines performance level based on average rating
 * @param {number} avgRating - Average rating
 * @return {string} Performance level ('good', 'medium', 'poor')
 */
function determinePerformanceLevel(avgRating) {
  if (avgRating >= 4.5) return 'good';
  if (avgRating >= 3.5) return 'medium';
  return 'poor';
}

/**
 * Gets performance data for testing
 * @return {Array} Test data
 */
function getTestPerformanceData() {
  return [
    {
      repName: "Jarviss",
      totalResponses: 11,
      avgRating: 4.6,
      fiveStarsToday: 5,
      fiveStarsTotal: 18,
      negatives: 0,
      milestoneProgress: {
        current: 18,
        target: 20,
        percentage: 90,
        progressText: "18/20 ★"
      },
      rewardDue: 750,
      performanceLevel: 'good'
    },
    {
      repName: "Claude",
      totalResponses: 10,
      avgRating: 2.3,
      fiveStarsToday: 1,
      fiveStarsTotal: 5,
      negatives: 8,
      milestoneProgress: {
        current: 5,
        target: 10,
        percentage: 50,
        progressText: "5/10 ★"
      },
      rewardDue: 250,
      performanceLevel: 'poor'
    },
    {
      repName: "Samuel-Scott",
      totalResponses: 10,
      avgRating: 3.6,
      fiveStarsToday: 4,
      fiveStarsTotal: 13,
      negatives: 0,
      milestoneProgress: {
        current: 13,
        target: 15,
        percentage: 60,
        progressText: "13/15 ★"
      },
      rewardDue: 500,
      performanceLevel: 'medium'
    }
  ];
}