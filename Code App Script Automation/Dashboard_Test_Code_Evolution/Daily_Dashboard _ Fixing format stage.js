/**
 * DailyDashboardTest.gs
 * Sheet-bound Apps Script: Test version of the Daily Performance Dashboard.
 * Reads from 'TestData' sheet, writes to 'Daily Dashboard' with dynamic tables.
 */

// ─── CONFIGURATION ───
const TEST_DATA_SHEET = 'TestData';
const DASHBOARD_SHEET = 'Daily Dashboard';

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
      writeRepTableDynamic(dash, []);
      writeLowAlertsDynamic(dash, []);
      dash.getRange('A2').setValue(`Last updated: ${formatDate(new Date())}`);
      return;
    }
    const header = allValues[0];
    const rows   = allValues.slice(1);
    const C = header.reduce((m, title, i) => { m[title] = i; return m; }, {});

    // 2) Parse rows
    const parsed = rows.map(r => {
      const raw     = r[C['Timestamp']];
      const timestamp = parseTimestamp(raw);
      const email     = r[C['Email Address']];
      const rep       = r[C['Who attended to your needs?']];
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

  
    // 6) Rep table dynamic with proper formatting
    const repStats = aggregateBy(todayData, 'rep', group => ({
      count: group.length,
      avg: +mean(group.map(x => x.stars)).toFixed(2),
      low: group.filter(x => x.stars < 3).length,
      fiveStar: group.filter(x => x.stars === 5).length
    }));
    console.log('📋 repStats:', repStats);
    
    // Format headers before writing data
    formatRepTableHeader(dash);
    const RepTableEndRow = writeRepTableDynamic(dash, repStats); // This returns the end row
    
    // 7) Low Rating Alerts dynamic with proper formatting
    const lowTitleRow = RepTableEndRow + 3; // Title goes 3 rows after rep Table ends
    const lowHeaderRow = lowTitleRow + 2; //Header goes 2 rows after the title
    const lowDataStartRow = lowHeaderRow + 1; // Data starts right after header
    
    // Format headers before writing data
    formatLowRatingTitle(dash, lowTitleRow)
    formatLowAlertHeader(dash, lowHeaderRow);
    const lowAlerts = todayData.filter(x => x.stars < 3).sort((a,b) => a.stars - b.stars);
    console.log('🚨 lowAlerts:', lowAlerts);
    writeLowAlertsDynamic(dash, lowAlerts, lowDataStartRow);
    
    // ... [rest of existing code] ...
  } catch (err) {
    console.error('❌ Error in updateDailyDashboardTest:', err);
    throw err;
  }
}

// ─── CLEAR KPI ───
function clearKPI(sheet) {
  ['B5','F5','F7','J5','J7','N5'].forEach(cell => sheet.getRange(cell).clearContent());
}

// ─── WRITE REP TABLE DYNAMIC ───
function writeRepTableDynamic(sheet, stats) {
  const START = 13;
  const MIN_ROWS = 5;
  const MAX_ROWS = 8;
  const MAX_NAMED_REPS = 8;
  
  // Determine display logic based on number of reps
  let disp = [];
  
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
      a.count += r.count;
      a.low += r.low;
      a.fiveStar += r.fiveStar;
      a.sumStars += r.avg * r.count;
      a.total += r.count;
      return a;
    }, { rep:'Others', count:0, low:0, fiveStar:0, sumStars:0, total:0 });
    
    agg.avg = +(agg.sumStars / agg.total).toFixed(2);
    disp.push(agg);
  }
  
  // Ensure minimum 5 rows by adding empty rows if needed
  while (disp.length < MIN_ROWS) {
    disp.push({ rep:'', count:'', avg:'', low:'', fiveStar:'' });
  }
  
  // Calculate how many rows we'll actually use
  const rowsToUse = Math.min(Math.max(disp.length, MIN_ROWS), MAX_ROWS);
  
  // Clear the entire potential table area
  sheet.getRange(`B${START}:O${START+MAX_ROWS-1}`).clearContent();
  
  // Write the data
  disp.slice(0, rowsToUse).forEach((r, i) => {
    const row = START + i;
    
    // Set values
    sheet.getRange(`B${row}`).setValue(r.rep).setHorizontalAlignment('left');
    sheet.getRange(`F${row}:G${row}`).merge().setValue(r.count).setHorizontalAlignment('center');
    sheet.getRange(`H${row}:J${row}`).merge().setValue(r.avg).setHorizontalAlignment('center');
    sheet.getRange(`K${row}:L${row}`).merge().setValue(r.low).setHorizontalAlignment('center');
    sheet.getRange(`N${row}:O${row}`).merge().setValue(r.fiveStar).setHorizontalAlignment('center');
    
    // Apply row formatting
    sheet.getRange(`B${row}:O${row}`)
      .setBackground('#ffffff')
      .setBorder(true, true, true, true, false, false, '#dedede', SpreadsheetApp.BorderStyle.SOLID)
      .setFontSize(10)
      .setFontColor('#000000');
    
    // Special formatting for "Others" row
    if (r.rep === 'Others') {
      sheet.getRange(`B${row}:O${row}`)
        .setFontColor('#b7b7b7')
        .setFontStyle('italic');
    }
  });
  
  // Return the last row used by the table (for calculating next section position)
  return START + rowsToUse - 1;
}

// ─── WRITE LOW ALERTS DYNAMIC ───
function formatLowRatingTitle(sheet, titleRow) {
  sheet.getRange(`B${titleRow}:H${titleRow}`)
    .merge()
    .setValue("Low Rating Alerts")
    .setFontSize(17)
    .setFontWeight('bold')
    .setHorizontalAlignment('left');
}

function formatLowAlertHeader(sheet, headerRow) {
  // Format the header row
  sheet.getRange(`B${headerRow}:O${headerRow}`)
    .setBackground('#fee7e8')
    .setBorder(true, true, true, true, false, false, '#ec6759', SpreadsheetApp.BorderStyle.SOLID)
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontColor('#c0392b');
  
  // Ensure proper merges with right alignment
  sheet.getRange(`B${headerRow}:C${headerRow}`).merge().setValue('Time').setHorizontalAlignment('left');
  sheet.getRange(`D${headerRow}:F${headerRow}`).merge().setValue('Customer').setHorizontalAlignment('left');
  sheet.getRange(`G${headerRow}`).setValue('Rep').setHorizontalAlignment('center');
  sheet.getRange(`I${headerRow}:J${headerRow}`).merge().setValue('Rating').setHorizontalAlignment('center');
  sheet.getRange(`L${headerRow}:O${headerRow}`).merge().setValue('Issues').setHorizontalAlignment('left');
}

function writeLowAlertsDynamic(sheet, lows, startRow) {
  const MIN_ROWS = 3;
  const MAX_ROWS = 8;
  
  // Clear the table area (all possible rows)
  sheet.getRange(`B${startRow}:O${startRow+MAX_ROWS-1}`).clearContent();
  
  // Handle empty state - "No low ratings today!"
  if (lows.length === 0) {
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
    
    // Set cell formatting for the entire row
    sheet.getRange(`B${row}:O${row}`)
      .setBackground('#fff5f5')
      .setBorder(true, true, true, true, false, false, '#ec6759', SpreadsheetApp.BorderStyle.SOLID)
      .setFontSize(10)
      .setFontColor('#c0392b');
    
    // Set values with proper merging and formatting
    if (r.timestamp) {
      sheet.getRange(`B${row}:C${row}`)
        .merge()
        .setValue(r.timestamp)
        .setNumberFormat('h:mm:ss AM/PM')
        .setHorizontalAlignment('left');
    }
    
    sheet.getRange(`D${row}:F${row}`).merge().setValue(r.email).setHorizontalAlignment('left');
    sheet.getRange(`G${row}`).setValue(r.rep).setHorizontalAlignment('center');
    sheet.getRange(`I${row}:J${row}`).merge().setValue(r.stars).setHorizontalAlignment('center');
    sheet.getRange(`L${row}:O${row}`).merge().setValue(r.issues).setHorizontalAlignment('left');
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
  const groups = data.reduce((m, r) => {
    (m[r[key]] = m[r[key]] || []).push(r);
    return m;
  }, {});
  return Object.entries(groups).map(([k, v]) => Object.assign({ rep: k }, aggFn(v)));
}

function formatRepTableHeader(sheet) {
  // Format the header row
  sheet.getRange('B12:O12')
    .setBackground('#f8f9fa')
    .setBorder(true, true, true, true, false, false, '#dedede', SpreadsheetApp.BorderStyle.SOLID)
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontColor('#666666');
  
  // Ensure proper merges
  sheet.getRange('F12:G12').merge().setValue('Responses').setHorizontalAlignment('center');
  sheet.getRange('H12:J12').merge().setValue('Avg. Rating').setHorizontalAlignment('center');
  sheet.getRange('K12:L12').merge().setValue('Low Rating').setHorizontalAlignment('center');
  sheet.getRange('N12:O12').merge().setValue('5 Star Count').setHorizontalAlignment('center');
}

function formatLowAlertHeader(sheet) {
  // Format the header row
  sheet.getRange('B23:O23')
    .setBackground('#fee7e8')
    .setBorder(true, true, true, true, false, false, '#ec6759', SpreadsheetApp.BorderStyle.SOLID)
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontColor('#c0392b');
  
  // Ensure proper merges
  sheet.getRange('B23:C23').merge().setValue('Time').setHorizontalAlignment('left');
  sheet.getRange('D23:F23').merge().setValue('Customer').setHorizontalAlignment('left');
  sheet.getRange('G23').setValue('Rep').setHorizontalAlignment('center');
  sheet.getRange('I23:J23').merge().setValue('Rating').setHorizontalAlignment('center');
  sheet.getRange('L23:O23').merge().setValue('Issues').setHorizontalAlignment('left');
}
