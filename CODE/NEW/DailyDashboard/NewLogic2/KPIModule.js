/**
 * KPI Module for CASAMANCE Dashboard
 * Creates KPI tiles layout for visual validation
 */

/**
 * Creates KPI tiles layout
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row for KPI tiles
 * @param {boolean} dataMode - If true, real data; if false, placeholder
 * @return {number} The next available row after KPI section
 */
function createKPITiles(sheet, startRow, dataMode = false) {
  Logger.log(`Creating KPI tiles at row ${startRow}`);
  const numRows = 3;
  const kpiBands = ['kpi1', 'kpi2', 'kpi3', 'kpi4'];
  
  // Create each KPI tile container
  kpiBands.forEach((bandName, idx) => {
    const container = createContainer(sheet, startRow, [bandName], numRows);
    // Placeholder title in first row of container
    container.range.getCell(1, 1)
      .setValue(`KPI ${idx + 1}`)
      .setFontFamily("Arial")
      .setFontSize(12)
      .setFontWeight("bold")
      .setFontColor(DASHBOARD_CONFIG.headerText)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
  });
  
  // Add a spacing row after KPI tiles
  createSpacing(sheet, startRow + numRows);
  
  // Return next row after spacing
  return startRow + numRows + 1;
} 