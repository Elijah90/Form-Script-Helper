/**
 * Grid System Module for CASAMANCE Dashboard
 * This module defines the column structure and provides utilities for grid management
 */

// Dashboard configuration constants
const DASHBOARD_CONFIG = {
    totalWidth: 1000,  // Total dashboard width in pixels
    backgroundColor: "#f8f9fa",
    containerBackground: "#f8f9fa", // Same as dashboard background
    tileBorder: "#dddddd"
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
    
    // Color each band differently for visualization
    const colors = ['#E3F2FD', '#FFFDE7', '#E8F5E9', '#FFEBEE', '#F3E5F5'];
    let colorIndex = 0;
    
    DASHBOARD_GRID.bands.forEach(band => {
      let color;
      if (band.purpose === "Spacer") {
        color = '#E0E0E0';  // Gray for spacers
      } else {
        color = colors[colorIndex % colors.length];
        colorIndex++;
      }
      
      band.columns.forEach(col => {
        sheet.getRange(startRow, col, numRows, 1)
          .setBackground(color)
          .setBorder(true, true, true, true, false, false);
        
        // Add band name as header
        sheet.getRange(startRow, col).setValue(band.name);
      });
    });
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
    
    // Visualize it
    visualizeGrid(sheet, 1, 5);
    
    Logger.log("Grid setup test completed");
  }