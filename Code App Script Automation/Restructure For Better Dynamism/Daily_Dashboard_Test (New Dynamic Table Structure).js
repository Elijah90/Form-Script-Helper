/**
 * DailyDashboardTest.gs
 * Sheet-bound Apps Script: Test version of the Daily Performance Dashboard.
 * Reads from 'TestData' sheet, writes to 'Daily Dashboard' with dynamic tables.
 * 
 * This version implements a fully dynamic table structure that:
 * 1. Completely clears the dashboard area before rebuilding
 * 2. Dynamically positions tables based on content
 * 3. Properly handles formatting for all states (min/max rows)
 * 4. Prevents formatting issues when switching between states
 */

// ─── CONFIGURATION ───
const TEST_DATA_SHEET = 'TestData';
const DASHBOARD_SHEET = 'Daily Dashboard';
const DASHBOARD_START_ROW = 10; // Row where tables begin (after KPI section)
const DASHBOARD_END_ROW = 50;   // Far enough to cover all possible table content

// ─── MAIN ENTRYPOINT ───
function updateDailyDashboardTest() {
  console.log('▶️ Starting updateDailyDashboardTest');
  try {
    const ss        = SpreadsheetApp.getActiveSpreadsheet();
    const dash      = ss.getSheetByName(DASHBOARD_SHEET);
    const dataSheet = ss.getSheetByName(TEST_DATA_SHEET);
    if (!dash || !dataSheet) {
      console.error('❌ Missing sheet:', !dash ? DASHBOARD_SHEET : TEST_DATA_SHEET);
      throw new Error(`Missing sheet: ${!dash ? DASHBOARD_SHEET : TEST_DATA_SHEET}`);
    }

    // 1) Load TestData
    const allValues = dataSheet.getDataRange().getValues();
    console.log(`📊 Loaded ${allValues.length - 1} rows from '${TEST_DATA_SHEET}'`);
    if (allValues.length < 2) {
      console.warn('⚠️ No test data found, clearing dashboard');
      clearKPI(dash);
      
      // Clear entire dashboard area
      clearDashboardArea(dash);
      
      dash.getRange('A2').setValue(`Last updated: ${formatDate(new Date())}`);
      return;
    }
    const header = allValues[0];
    const rows   = allValues.slice(1);
    const C = header.reduce((m, title, i) => { m[title] = i; return m; }, {});

    // 2) Parse rows
    const parsed = rows.map((r, index) => {
      const raw     = r[C['Timestamp']];
      const timestamp = parseTimestamp(raw);
      const email     = r[C['Email Address']];
      
      // Add debugging to see what column names are available
      if (index === 0) {
        console.log('Available columns:', Object.keys(C));
      }
      
      // Enhanced rep extraction with detailed logging
      let rep;
      let repColumnUsed = '';
      
      // Try all possible column names for representative
      if (C['Who attended to you needs?'] !== undefined) {
        rep = r[C['Who attended to you needs?']];
        repColumnUsed = 'Who attended to you needs?';
      } else if (C['Rep'] !== undefined) {
        rep = r[C['Rep']];
        repColumnUsed = 'Rep';
      } else if (C['Representative'] !== undefined) {
        rep = r[C['Representative']];
        repColumnUsed = 'Representative';
      }
      
      // Log detailed information about the first 5 rows to help diagnose issues
      if (index < 5) {
        console.log(`Row ${index} rep extraction:`, {
          email: email,
          repColumnUsed: repColumnUsed,
          rawRepValue: rep,
          repType: typeof rep
        });
      }
      
      // Only set to 'Unknown' if truly undefined, null, or empty string
      if (rep === undefined || rep === null || rep === '') {
        rep = 'Unknown';
      } else {
        // Ensure rep is a string to avoid issues with object properties
        rep = String(rep);
      }
      
      // Log the final rep value for the first few rows
      if (index < 5) {
        console.log(`Row ${index} final rep value:`, rep);
      }
      
      const stars     = Number(r[C['How would you rate our services on a scale of 1 to 5 stars?']]);
      let issues = '';
      if (r[C['Has your need been met?']] === 'No') {
        issues = r[C['You chose NO, Please share your feedback. (1)']];
      } else if (r[C["Were you satisfied with the Rep's presentation?"]] === 'No') {
        issues = r[C['You chose NO, Please share your feedback. (2)']];
      } else if (r[C['Did the information and product knowledge match your expectations?']] === 'No') {
        issues = r[C['You chose NO, Please share your feedback. (3)']];
      }
      return { timestamp, email, rep, stars, issues };
    });
    console.log(`🔍 Parsed ${parsed.length} entries`);

    // 3) Separate today vs. yesterday
    const today     = new Date();
    const yesterday = offsetDate(today, -1);
    const todayData     = parsed.filter(x => isSameDay(x.timestamp, today));
    const yesterdayData = parsed.filter(x => isSameDay(x.timestamp, yesterday));
    console.log('📅 Counts:', { today: todayData.length, yesterday: yesterdayData.length });

    // 4) Compute KPIs
    const total    = todayData.length;
    const avgToday = total ? mean(todayData.map(x => x.stars)) : 0;
    const avgYest  = yesterdayData.length ? mean(yesterdayData.map(x => x.stars)) : null;
    const delta    = avgYest !== null ? +(avgToday - avgYest).toFixed(2) : null;
    const lowCount = todayData.filter(x => x.stars < 3).length;
    const fiveStar = todayData.filter(x => x.stars === 5).length;
    console.log('📈 KPIs:', { total, avgToday, avgYest, delta, lowCount, fiveStar });

    // 5) Write KPI boxes
    dash.getRange('B5').setValue(total);
    dash.getRange('F5').setValue(+avgToday.toFixed(2));
    dash.getRange('F7').setValue(delta === null ? '' : (delta > 0 ? `↑ ${delta}` : `↓ ${Math.abs(delta)}`));
    dash.getRange('J5').setValue(lowCount);
    dash.getRange('J7').setValue(lowCount === 0 ? '' : 'Need attention');
    dash.getRange('N5').setValue(fiveStar);

    // IMPORTANT: Clear entire dashboard area before rebuilding
    clearDashboardArea(dash);
    
    // 6) Create Rep Performance Table Section
    // 6.1 Write section title
    const repTitleRow = DASHBOARD_START_ROW;
    dash.getRange(`B${repTitleRow}:H${repTitleRow}`)
      .merge()
      .setValue("Representative Performances")
      .setFontSize(17)
      .setFontWeight('bold')
      .setHorizontalAlignment('left');
    
    // 6.2 Create header row (fixed at repTitleRow + 2)
    const repHeaderRow = repTitleRow + 2;
    formatRepTableHeader(dash, repHeaderRow);
    
    // 6.3 Prepare rep stats
    const repStats = aggregateBy(todayData, 'rep', group => ({
      count: group.length,
      avg: +mean(group.map(x => x.stars)).toFixed(2),
      low: group.filter(x => x.stars < 3).length,
      fiveStar: group.filter(x => x.stars === 5).length
    }));
    console.log('📋 repStats:', repStats);
    
    // 6.4 Write table data starting at repHeaderRow + 1
    const repTableStartRow = repHeaderRow + 1;
    const repTableEndRow = writeRepTableDynamic(dash, repStats, repTableStartRow);
    
    // 7) Create Low Rating Alerts Section
    // 7.1 Write section title with correct spacing
    const lowTitleRow = repTableEndRow + 3;
    dash.getRange(`B${lowTitleRow}:H${lowTitleRow}`)
      .merge()
      .setValue("Low Rating Alerts")
      .setFontSize(17)
      .setFontWeight('bold')
      .setHorizontalAlignment('left');
    
    // 7.2 Create header row
    const lowHeaderRow = lowTitleRow + 2;
    formatLowAlertHeader(dash, lowHeaderRow);
    
    // 7.3 Write low rating data
    const lowDataStartRow = lowHeaderRow + 1;
    const lowAlerts = todayData.filter(x => x.stars < 3).sort((a,b) => a.stars - b.stars);
    console.log('🚨 lowAlerts:', lowAlerts);
    writeLowAlertsDynamic(dash, lowAlerts, lowDataStartRow);
    
    // Update timestamp
    dash.getRange('A2').setValue(`Last updated: ${formatDate(new Date())}`);
    
  } catch (err) {
    console.error('❌ Error in updateDailyDashboardTest:', err);
    throw err;
  }
}

// ─── CLEAR DASHBOARD AREA ───
function clearDashboardArea(sheet) {
  // Clear all content in the dashboard area
  sheet.getRange(`B${DASHBOARD_START_ROW}:O${DASHBOARD_END_ROW}`).clearContent();
  
  // Break apart any merged cells
  try {
    sheet.getRange(`B${DASHBOARD_START_ROW}:O${DASHBOARD_END_ROW}`).breakApart();
  } catch (e) {
    console.log('Some cells could not be broken apart, continuing anyway');
  }
  
  // Clear all formatting
  sheet.getRange(`B${DASHBOARD_START_ROW}:O${DASHBOARD_END_ROW}`)
    .clearFormat()
    .setBorder(false, false, false, false, false, false);
}

// ─── CLEAR KPI ───
function clearKPI(sheet) {
  ['B5','F5','F7','J5','J7','N5'].forEach(cell => sheet.getRange(cell).clearContent());
}

// ─── FORMAT REP TABLE HEADER ───
function formatRepTableHeader(sheet, headerRow) {
  // Unmerge any existing merged cells in this row first
  try {
    sheet.getRange(`B${headerRow}:O${headerRow}`).breakApart();
  } catch (e) {
    console.log('No merged cells to break apart');
  }
  
  // Format the header row
  sheet.getRange(`B${headerRow}:O${headerRow}`)
    .setBackground('#f8f9fa')
    .setBorder(true, true, true, true, false, false, '#dedede', SpreadsheetApp.BorderStyle.SOLID)
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontColor('#666666');
  
  // Ensure proper merges
  sheet.getRange(`B${headerRow}`).setValue('Representative').setHorizontalAlignment('left');
  sheet.getRange(`F${headerRow}:G${headerRow}`).merge().setValue('Responses').setHorizontalAlignment('center');
  sheet.getRange(`H${headerRow}:J${headerRow}`).merge().setValue('Avg. Rating').setHorizontalAlignment('center');
  sheet.getRange(`K${headerRow}:L${headerRow}`).merge().setValue('Low Rating').setHorizontalAlignment('center');
  sheet.getRange(`N${headerRow}:O${headerRow}`).merge().setValue('5 Star Count').setHorizontalAlignment('center');
}

// ─── WRITE REP TABLE DYNAMIC ───
function writeRepTableDynamic(sheet, stats, startRow) {
  const MIN_ROWS = 5;
  const MAX_ROWS = 8;
  const MAX_NAMED_REPS = 8;
  
  // Determine display logic based on number of reps
  let disp = [];
  
  // Enhanced debugging to see what's coming in
  console.log('Stats object type:', typeof stats);
  console.log('Stats is array:', Array.isArray(stats));
  console.log('Stats length:', stats ? stats.length : 0);
  console.log('Stats first few items:', stats && stats.length > 0 ? JSON.stringify(stats.slice(0, 3)) : 'empty');
  
  // Make sure stats is an array
  if (!Array.isArray(stats)) {
    console.error('Stats is not an array! Converting to array format.');
    // If stats is not an array (possibly an object from aggregateBy), convert it
    stats = Object.entries(stats || {}).map(([k, v]) => ({
      rep: k,
      ...v
    }));
  }
  
  if (stats.length <= MAX_NAMED_REPS) {
    // If 8 or fewer reps, show all of them (no "Others" row)
    disp = stats.slice();
  } else {
    // If more than 8 reps, show first 7 and aggregate the rest as "Others"
    const top = stats.slice(0, MAX_NAMED_REPS - 1);
    const extra = stats.slice(MAX_NAMED_REPS - 1);
    
    disp = top.slice();
    
    // Create "Others" row by aggregating remaining reps
    const agg = extra.reduce((a, r) => {
      a.count += r.count || 0;
      a.low += r.low || 0;
      a.fiveStar += r.fiveStar || 0;
      a.sumStars += (r.avg || 0) * (r.count || 0);
      a.total += r.count || 0;
      return a;
    }, { rep:'Others', count:0, low:0, fiveStar:0, sumStars:0, total:0 });
    
    agg.avg = agg.total ? +(agg.sumStars / agg.total).toFixed(2) : 0;
    disp.push(agg);
  }
  
  // Log the display data for debugging
  console.log('Display data prepared:', disp.map(r => ({ rep: r.rep, count: r.count })));
  
  // Ensure minimum 5 rows by adding empty rows if needed
  while (disp.length < MIN_ROWS) {
    disp.push({ rep:'', count:'', avg:'', low:'', fiveStar:'' });
  }
  
  // Calculate how many rows we'll actually use
  const rowsToUse = Math.min(Math.max(disp.length, MIN_ROWS), MAX_ROWS);
  
  // Write the data
  disp.slice(0, rowsToUse).forEach((r, i) => {
    const row = startRow + i;
    
    // Safely break apart any merged cells in this row first
    try {
      sheet.getRange(`B${row}:O${row}`).breakApart();
    } catch (e) {
      console.log('No merged cells to break apart in row ' + row);
    }
    
    // Ensure rep is a string and properly formatted
    const repValue = r.rep !== undefined && r.rep !== null ? String(r.rep) : '';
    
    // Set values with proper type handling
    sheet.getRange(`B${row}`).setValue(repValue).setHorizontalAlignment('left');
    
    // Format values to show '-' for zero or empty values
    const countValue = (r.count === 0 || r.count === '') ? '-' : r.count;
    const avgValue = (r.avg === 0 || r.avg === '') ? '-' : r.avg;
    const lowValue = (r.low === 0 || r.low === '') ? '-' : r.low;
    const fiveStarValue = (r.fiveStar === 0 || r.fiveStar === '') ? '-' : r.fiveStar;
    
    // Log formatted values for debugging
    console.log(`Formatted values for ${repValue}:`, {
      count: countValue,
      avg: avgValue,
      low: lowValue,
      fiveStar: fiveStarValue
    });
    
    sheet.getRange(`F${row}:G${row}`).merge().setValue(countValue).setHorizontalAlignment('center');
    sheet.getRange(`H${row}:J${row}`).merge().setValue(avgValue).setHorizontalAlignment('center');
    sheet.getRange(`K${row}:L${row}`).merge().setValue(lowValue).setHorizontalAlignment('center');
    sheet.getRange(`N${row}:O${row}`).merge().setValue(fiveStarValue).setHorizontalAlignment('center');
    
    // Apply row formatting
    sheet.getRange(`B${row}:O${row}`)
      .setBackground('#ffffff')
      .setBorder(true, true, true, true, false, false, '#dedede', SpreadsheetApp.BorderStyle.SOLID)
      .setFontSize(10)
      .setFontColor('#000000');
    
    // Special formatting for "Others" row
    if (repValue === 'Others') {
      sheet.getRange(`B${row}:O${row}`)
        .setFontColor('#b7b7b7')
        .setFontStyle('italic');
    }
    
    // Log what we're writing for debugging
    if (i < 3) {
      console.log(`Writing row ${i} (${row}):`, { 
        rep: repValue, 
        count: r.count, 
        avg: r.avg, 
        low: r.low, 
        fiveStar: r.fiveStar 
      });
    }
  });
  
  // Return the last row used by the table (for calculating next section position)
  return startRow + rowsToUse - 1;
}

// ─── FORMAT LOW ALERT HEADER ───
function formatLowAlertHeader(sheet, headerRow) {
  // Unmerge any existing merged cells in this row first
  try {
    sheet.getRange(`B${headerRow}:O${headerRow}`).breakApart();
  } catch (e) {
    console.log('No merged cells to break apart');
  }
  
  // Format the header row
  sheet.getRange(`B${headerRow}:O${headerRow}`)
    .setBackground('#fee7e8')
    .setBorder(true, true, true, true, false, false, '#ec6759', SpreadsheetApp.BorderStyle.SOLID)
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontColor('#c0392b');
  
  // Now merge cells
  sheet.getRange(`B${headerRow}:C${headerRow}`).merge().setValue('Time').setHorizontalAlignment('left');
  sheet.getRange(`D${headerRow}:F${headerRow}`).merge().setValue('Customer').setHorizontalAlignment('left');
  sheet.getRange(`G${headerRow}`).setValue('Rep').setHorizontalAlignment('center');
  sheet.getRange(`I${headerRow}:J${headerRow}`).merge().setValue('Rating').setHorizontalAlignment('center');
  sheet.getRange(`L${headerRow}:O${headerRow}`).merge().setValue('Issues').setHorizontalAlignment('left');
}

// ─── WRITE LOW ALERTS DYNAMIC ───
function writeLowAlertsDynamic(sheet, lows, startRow) {
  const MIN_ROWS = 3;
  const MAX_ROWS = 8;
  
  // Enhanced debugging for low alerts
  console.log('Low alerts data:', lows.length > 0 ? 
    lows.slice(0, 3).map(l => ({ 
      email: l.email, 
      rep: l.rep, 
      repType: typeof l.rep, 
      stars: l.stars 
    })) : 'No low alerts');
  
  // Handle empty state - "No low ratings today!"
  if (lows.length === 0) {
    // Break apart cells first
    try {
      sheet.getRange(`B${startRow}:F${startRow}`).breakApart();
    } catch (e) {
      console.log('No merged cells to break apart');
    }
    
    sheet.getRange(`B${startRow}:F${startRow}`)
      .merge()
      .setValue("No low ratings today!")
      .setHorizontalAlignment('center')
      .setFontColor('#2e7d32')
      .setBackground('#fff5f5')
      .setFontSize(10);
    return;
  }
  
  // Get data to show (up to MAX_ROWS)
  const show = lows.slice(0, MAX_ROWS);
  
  // Fill with empty rows if needed to meet minimum
  while (show.length < MIN_ROWS) {
    show.push({ timestamp:null, email:'', rep:'', stars:'', issues:'' });
  }
  
  // Write the rows
  show.forEach((r, i) => {
    const row = startRow + i;
    
    // Safely break apart any merged cells in this row first
    try {
      sheet.getRange(`B${row}:O${row}`).breakApart();
    } catch (e) {
      console.log('No merged cells to break apart in row ' + row);
    }
    
    // Clear and set cell formatting for the entire row
    sheet.getRange(`B${row}:O${row}`)
      .clearContent()
      .clearFormat()
      .setBackground('#fff5f5')
      .setBorder(true, true, true, true, false, false, '#ec6759', SpreadsheetApp.BorderStyle.SOLID)
      .setFontSize(10)
      .setFontColor('#c0392b')
      .setFontWeight('normal');
    
    // Set values with proper merging and formatting
    if (r.timestamp) {
      sheet.getRange(`B${row}:C${row}`)
        .merge()
        .setValue(r.timestamp)
        .setNumberFormat('h:mm:ss AM/PM')
        .setHorizontalAlignment('left');
    }
    
    // Ensure rep is a string and properly formatted
    const repValue = r.rep !== undefined && r.rep !== null ? String(r.rep) : '';
    
    // Log what we're writing for debugging (first few rows)
    if (i < 3) {
      console.log(`Writing low alert row ${i} (${row}):`, { 
        email: r.email, 
        rep: repValue, 
        stars: r.stars, 
        issues: r.issues 
      });
    }
    
    // Extract clean email from potential markdown format [xxx](mailto:xxx)
    let cleanEmail = r.email;
    if (cleanEmail) {
      // Check if email is in markdown format [xxx](mailto:xxx) and extract just the email
      const markdownMatch = cleanEmail.match(/\[(.*?)\]\(mailto:(.*?)\)/);
      if (markdownMatch) {
        // Use the email part (either from the display text or the actual mailto)
        cleanEmail = markdownMatch[1] || markdownMatch[2];
      }
    }
    const formattedEmail = cleanEmail || '-';
    
    // Format values to show '-' for zero or empty values
    const starsValue = (r.stars === 0 || r.stars === '') ? '-' : r.stars;
    const issuesValue = r.issues || '-';
    
    // Log formatted values for debugging
    console.log(`Formatted low alert values for row ${row}:`, {
      email: formattedEmail,
      rep: repValue,
      stars: starsValue,
      issues: issuesValue
    });
    
    sheet.getRange(`D${row}:F${row}`).merge().setValue(formattedEmail).setHorizontalAlignment('left');
    sheet.getRange(`G${row}`).setValue(repValue || '-').setHorizontalAlignment('center');
    sheet.getRange(`I${row}:J${row}`).merge().setValue(starsValue).setHorizontalAlignment('center');
    sheet.getRange(`L${row}:O${row}`).merge().setValue(issuesValue).setHorizontalAlignment('left');
  });
}

// ─── HELPERS ───
function parseTimestamp(s) {
  if (s instanceof Date) return s;
  if (typeof s === 'string') {
    const p = s.split(/[/ :]/).map(Number);
    return new Date(p[2], p[0]-1, p[1], p[3], p[4], p[5]);
  }
  if (typeof s === 'number') return new Date(s);
  return new Date(s);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function offsetDate(d, delta) {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
}

function mean(arr) {
  return arr.reduce((sum, v) => sum + v, 0) / (arr.length || 1);
}

function formatDate(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM dd, yyyy hh:mm a');
}

function aggregateBy(data, key, aggFn) {
  // Enhanced debugging to see what's coming in
  console.log(`Aggregating by ${key}, sample data:`, data.length > 0 ? JSON.stringify(data[0]) : 'empty');
  
  // Log all unique values for the key to help diagnose issues
  const uniqueValues = [...new Set(data.map(item => item[key]))];
  console.log(`All unique ${key} values:`, uniqueValues);
  
  // Log the first few items with their rep values for debugging
  const sampleItems = data.slice(0, 5);
  sampleItems.forEach((item, index) => {
    console.log(`Sample item ${index} ${key} value:`, item[key], typeof item[key]);
  });
  
  // Pre-process the data to ensure all rep values are properly formatted
  const processedData = data.map(item => {
    // Create a new object to avoid modifying the original
    const newItem = {...item};
    
    // Ensure the key value is properly formatted
    if (newItem[key] === undefined || newItem[key] === null || newItem[key] === '') {
      newItem[key] = 'Unknown';
    } else {
      // Force to string to avoid issues with object properties
      newItem[key] = String(newItem[key]).trim();
    }
    
    return newItem;
  });
  
  const groups = processedData.reduce((m, r) => {
    // Get the properly formatted key value
    const groupKey = r[key];
    
    // Ensure we're using strings as keys to avoid issues with object properties
    (m[groupKey] = m[groupKey] || []).push(r);
    return m;
  }, {});
  
  // Debug the groups created with counts
  const groupCounts = Object.entries(groups).map(([k, v]) => ({ name: k, count: v.length }));
  console.log('Groups created with counts:', groupCounts);
  
  return Object.entries(groups).map(([k, v]) => Object.assign({ rep: k }, aggFn(v)));
}