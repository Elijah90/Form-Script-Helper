/**
 * Grid System Module for CASAMANCE Dashboard
 * This module defines the column structure and provides utilities for grid management
 */

// Dashboard configuration constants
const DASHBOARD_CONFIG = {
  totalWidth: 1000,  // Total dashboard width in pixels
  backgroundColor: "#f8f9fa",      // Light gray dashboard background
  elementBackground: "#ffffff",     // White background for elements
  tileBorder: "#dddddd",           // Light gray borders
  headerText: "#333333",           // Dark gray text
  subText: "#666666"               // Medium gray text
};

// Centralized grid definition
const DASHBOARD_GRID = {
  // Dashboard boundaries
  bounds: {
    startColumn: 1,  // Column A
    endColumn: 14,   // Column N
    totalWidth: DASHBOARD_CONFIG.totalWidth
  },
  
  // Band definitions - groups of columns with specific purposes
  bands: [
    {
      name: "kpi1",
      columns: [1, 2],      // A, B
      widths: [110, 120],   // Total: 230px
      purpose: "KPI Tile 1"
    },
    {
      name: "spacer1",
      columns: [3],         // C
      widths: [30],
      purpose: "Spacer"
    },
    {
      name: "kpi2", 
      columns: [4, 5],      // D, E
      widths: [110, 120],   // Total: 230px
      purpose: "KPI Tile 2"
    },
    {
      name: "spacer2",
      columns: [6],         // F
      widths: [30],
      purpose: "Spacer"
    },
    {
      name: "kpi3",
      columns: [7, 8],      // G, H
      widths: [110, 120],   // Total: 230px
      purpose: "KPI Tile 3"
    },
    {
      name: "spacer3",
      columns: [9],         // I
      widths: [30],
      purpose: "Spacer"
    },
    {
      name: "kpi4",
      columns: [10, 11],    // J, K
      widths: [110, 120],   // Total: 230px
      purpose: "KPI Tile 4"
    }
  ],
  
  // Visual element definitions for KPI tiles
  kpiElements: {
    title: { 
      span: "all",  // Spans all columns in the band
      merge: true 
    },
    value: { 
      span: "first", // First column only
      merge: false 
    },
    secondary: { 
      span: "second", // Second column only
      merge: false 
    },
    change: { 
      span: "all",  // All columns in the band
      merge: true 
    }
  }
};

/**
 * Sets up the grid by applying column widths
 * @param {Sheet} sheet - The Google Sheet to set up
 */
function setupGrid(sheet) {
  Logger.log("Setting up dashboard grid...");
  
  // First, set all columns to default width to reset
  const maxCol = DASHBOARD_GRID.bounds.endColumn;
  for (let col = 1; col <= maxCol; col++) {
    sheet.setColumnWidth(col, 100);
  }
  
  // Apply specific widths from grid definition
  DASHBOARD_GRID.bands.forEach(band => {
    band.columns.forEach((col, idx) => {
      sheet.setColumnWidth(col, band.widths[idx]);
      Logger.log(`Set column ${col} width to ${band.widths[idx]}px (${band.name})`);
    });
  });
  
  // Validate grid setup
  validateGrid();
}

/**
 * Validates that the grid configuration is correct
 * @throws {Error} If grid configuration is invalid
 */
function validateGrid() {
  let totalWidth = 0;
  
  DASHBOARD_GRID.bands.forEach(band => {
    const bandWidth = band.widths.reduce((sum, width) => sum + width, 0);
    totalWidth += bandWidth;
    
    // Ensure columns and widths arrays match
    if (band.columns.length !== band.widths.length) {
      throw new Error(`Band "${band.name}" has mismatched columns and widths arrays`);
    }
  });
  
  Logger.log(`Grid validation: Total width = ${totalWidth}px (Expected: ${DASHBOARD_CONFIG.totalWidth}px)`);
  
  // For now, we'll just log if widths don't match exactly
  // In production, you might want to auto-adjust or throw an error
  if (totalWidth !== DASHBOARD_CONFIG.totalWidth) {
    Logger.log(`Warning: Grid width (${totalWidth}px) doesn't match expected dashboard width (${DASHBOARD_CONFIG.totalWidth}px)`);
  }
}

/**
 * Gets the columns for a specific band
 * @param {string} bandName - Name of the band
 * @return {Object} Band information including columns and widths
 */
function getBand(bandName) {
  const band = DASHBOARD_GRID.bands.find(b => b.name === bandName);
  if (!band) {
    throw new Error(`Band "${bandName}" not found in grid definition`);
  }
  return band;
}

/**
 * Gets multiple bands and their combined column range
 * @param {string[]} bandNames - Array of band names
 * @return {Object} Combined band information
 */
function getBands(bandNames) {
  const bands = bandNames.map(name => getBand(name));
  
  // Calculate the full column range
  const allColumns = bands.flatMap(b => b.columns);
  const startCol = Math.min(...allColumns);
  const endCol = Math.max(...allColumns);
  const totalWidth = bands.reduce((sum, band) => 
    sum + band.widths.reduce((s, w) => s + w, 0), 0
  );
  
  return {
    bands: bands,
    startColumn: startCol,
    endColumn: endCol,
    columnCount: endCol - startCol + 1,
    totalWidth: totalWidth
  };
}

/**
 * Visualizes the grid for debugging
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} startRow - Starting row for visualization
 * @param {number} numRows - Number of rows to visualize
 */
function visualizeGrid(sheet, startRow = 1, numRows = 10) {
  Logger.log("Visualizing grid structure...");
  
  // First, set dashboard background for the area
  sheet.getRange(startRow, 1, numRows, DASHBOARD_GRID.bounds.endColumn)
    .setBackground(DASHBOARD_CONFIG.backgroundColor);
  
  // Set header row height to accommodate info
  sheet.setRowHeight(startRow, 50);
  
  // Color each band differently for visualization
  const kpiColors = ['#E3F2FD', '#FFF9C4', '#E8F5E9', '#FFEBEE']; // Light blue, yellow, green, red
  const spacerColor = '#E0E0E0'; // Gray for spacers
  let kpiIndex = 0;
  
  DASHBOARD_GRID.bands.forEach(band => {
    let color;
    if (band.purpose === "Spacer") {
      color = spacerColor;
    } else {
      color = kpiColors[kpiIndex % kpiColors.length];
      kpiIndex++;
    }
    
    band.columns.forEach(col => {
      const range = sheet.getRange(startRow, col, numRows, 1);
      range.setBackground(color);
      
      // Add band name and column info as header
      sheet.getRange(startRow, col)
        .setValue(`${band.name}\n(Col ${String.fromCharCode(64 + col)})\n${band.widths[band.columns.indexOf(col)]}px`)
        .setFontSize(9)
        .setVerticalAlignment("middle")
        .setHorizontalAlignment("center")
        .setWrap(true);
    });
  });
  
  // Add a legend below the visualization
  const legendRow = startRow + numRows + 1;
  sheet.getRange(legendRow, 1, 1, 11)
    .merge()
    .setValue("Grid Structure: KPI tiles use 2 columns each (110px + 120px = 230px), with 30px spacers between")
    .setFontSize(10)
    .setFontColor("#666666")
    .setFontStyle("italic");
}

/**
 * Test function to verify grid setup
 */
function testGridSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('DailyDash');
  
  if (!sheet) {
    sheet = ss.insertSheet('DailyDash');
  }
  
  // Set up the grid
  setupGrid(sheet);
  
  // Hide gridlines for cleaner look
  sheet.setHiddenGridlines(true);
  
  // Add a title for the visualization
  sheet.getRange(1, 1, 1, 11)
    .merge()
    .setValue("Dashboard Grid Structure Visualization")
    .setFontSize(14)
    .setFontWeight("bold")
    .setFontColor(DASHBOARD_CONFIG.headerText)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 30);
  
  // Visualize it starting from row 2
  visualizeGrid(sheet, 2, 5);
  
  Logger.log("Grid setup test completed");
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Grid setup completed with visualization!", 
    "Success", 
    3
  );
}