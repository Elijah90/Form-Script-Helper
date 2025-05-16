# Updated Dynamic Table Layout for Dashboard

Based on the mockup, current implementation, and the need for a dynamic layout system, here's how I would restructure the table to properly align with KPI tiles while accommodating all headers:

## Revised Band-Based Column Structure

I'll design a more flexible band-based structure that keeps alignment with KPIs while providing enough space for all headers:

```markdown
┌───────────┬────────────────┬────────────────┬────────────────┐
│  Band 1   │     Band 2     │     Band 3     │     Band 4     │
│ (A-B-C)   │   (D-E-F)      │   (G-H-I)      │   (J-K-L)      │
└───────────┴────────────────┴────────────────┴────────────────┘
```

### New Column Configuration

```javascript
/**
 * Updated band definition with better distribution
 * @type {Object}
 */
const DASHBOARD_BANDS = {
  // Band 1: Rep information
  band1: {
    columns: ["A", "B", "C"],
    width: [90, 90, 50],  // Total: 230px
    headers: ["Rep Name"]
  },
  
  // Band 2: Performance data 
  band2: {
    columns: ["D", "E", "F"],
    width: [70, 80, 80],  // Total: 230px
    headers: ["Responses", "Rating", "5★ Today"]
  },
  
  // Band 3: Milestone data
  band3: {
    columns: ["G", "H", "I"],
    width: [80, 100, 50],  // Total: 230px
    headers: ["5★ Total", "Milestone Progress"]
  },
  
  // Band 4: Rewards and negatives
  band4: {
    columns: ["J", "K", "L"],
    width: [120, 110, 30],  // Total: 260px
    headers: ["Reward Due", "Negatives"]
  }
};
```

## Table Header Structure

Instead of trying to force all headers into the exact same column positions as KPIs, I'll use a more flexible approach that maintains visual alignment with KPIs while properly accommodating all headers:

```markdown
┌─────────────────┬───────────────────────────────────┬───────────────────────────┬───────────────────────┐
│                 │                                   │                           │                       │
│   Rep Name      │   Performance Metrics             │   Milestone Data          │   Rewards & Feedback  │
│                 │                                   │                           │                       │
├─────────────────┼───────────┬──────────┬────────────┼───────────┬───────────────┼───────────┬───────────┤
│                 │           │          │            │           │               │           │           │
│   Rep Name      │ Responses │ Rating   │ 5★ Today   │ 5★ Total  │ Milestone     │ Reward    │ Negatives │
│                 │           │          │            │           │ Progress      │ Due       │           │
└─────────────────┴───────────┴──────────┴────────────┴───────────┴───────────────┴───────────┴───────────┘
```

## Implementation in the Grid System

Here's how I'd implement this in the new dynamic grid system:

```javascript
/**
 * Creates the table header structure using the band system
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} row - The header row
 * @param {Object} gridInfo - Grid information from setupDashboardGrid
 */
function createTableHeaders(sheet, row, gridInfo) {
  // Set main section headers (merged across appropriate bands)
  createMergedHeader(sheet, row, "A", "C", "Rep Name");
  createMergedHeader(sheet, row, "D", "F", "Performance Metrics");
  createMergedHeader(sheet, row, "G", "I", "Milestone Data");
  createMergedHeader(sheet, row, "J", "L", "Rewards & Feedback");
  
  // Set subheaders in the next row
  const subHeaderRow = row + 1;
  
  // Band 1 subheader
  createSubHeader(sheet, subHeaderRow, "A", "C", "Rep Name");
  
  // Band 2 subheaders (individual columns)
  sheet.getRange(`D${subHeaderRow}`).setValue("Responses");
  sheet.getRange(`E${subHeaderRow}`).setValue("Rating");
  sheet.getRange(`F${subHeaderRow}`).setValue("5★ Today");
  
  // Band 3 subheaders
  sheet.getRange(`G${subHeaderRow}`).setValue("5★ Total");
  createSubHeader(sheet, subHeaderRow, "H", "I", "Milestone Progress");
  
  // Band 4 subheaders
  sheet.getRange(`J${subHeaderRow}`).setValue("Reward Due");
  sheet.getRange(`K${subHeaderRow}`).setValue("Negatives");
}

/**
 * Helper function to create a merged header cell
 */
function createMergedHeader(sheet, row, startCol, endCol, text) {
  const range = sheet.getRange(`${startCol}${row}:${endCol}${row}`);
  range.merge()
       .setValue(text)
       .setBackground("#f1f3f4")
       .setFontWeight("bold")
       .setHorizontalAlignment("center");
}
```

## Data Row Implementation

For the data rows, we'll use a similar band-based approach but with more granular control:

```javascript
/**
 * Creates a data row for a representative using the band system
 * @param {Sheet} sheet - The dashboard sheet
 * @param {number} row - The row number
 * @param {Object} repData - Data for this representative
 * @param {Object} gridInfo - Grid information
 */
function createRepDataRow(sheet, row, repData, gridInfo) {
  // Get background color based on performance
  const bgColor = getPerformanceColor(repData.avgRating);
  
  // Set background for the entire row
  sheet.getRange(`A${row}:L${row}`).setBackground(bgColor);
  
  // Band 1: Rep Name (merged)
  createMergedCell(sheet, row, "A", "C", repData.repName);
  
  // Band 2: Performance data (individual cells)
  sheet.getRange(`D${row}`).setValue(repData.totalResponses);
  sheet.getRange(`E${row}`).setValue(repData.avgRating);
  sheet.getRange(`F${row}`).setValue(repData.fiveStarsToday);
  
  // Band 3: Milestone data
  sheet.getRange(`G${row}`).setValue(repData.fiveStarsTotal);
  createMilestoneProgressCell(sheet, row, "H", "I", repData.milestoneProgress);
  
  // Band 4: Rewards and negatives
  const rewardText = repData.rewardDue > 0 ? `£${repData.rewardDue} (earned)` : "-";
  sheet.getRange(`J${row}`).setValue(rewardText);
  sheet.getRange(`K${row}`).setValue(repData.negatives);
}
```

## New Container-Based Approach Benefits

With this redesigned structure:

1. **Better Header Accommodation**: All headers get proper space
2. **Visual Alignment**: Table still aligns visually with KPI tiles (same band width)
3. **Flexibility**: Can add/remove columns within bands as needed
4. **Consistent Styling**: Uses the same coloring and formatting logic

## Implementation in Grid System

To implement this in the new grid system we discussed:

```javascript
// Example setup in GridSystem.js
function setupDashboardGrid(sheet) {
  // Set band-based column widths
  DASHBOARD_BANDS.band1.columns.forEach((col, index) => {
    sheet.setColumnWidth(columnToIndex(col), DASHBOARD_BANDS.band1.width[index]);
  });
  
  // Similar for other bands...
  
  return {
    bands: DASHBOARD_BANDS,
    // Other grid information...
  };
}

// Example in ContainerSystem.js
function createTableContainer(sheet, startRow, gridInfo) {
  // Create container spanning all bands
  const container = {
    startRow: startRow,
    headerRow: startRow + 1,
    dataStartRow: startRow + 3,
    columns: {
      band1: gridInfo.bands.band1.columns,
      band2: gridInfo.bands.band2.columns,
      band3: gridInfo.bands.band3.columns,
      band4: gridInfo.bands.band4.columns
    }
  };
  
  // Return container info for the table renderer to use
  return container;
}
```

This approach provides the flexibility you need while maintaining proper alignment with the KPI structure above. It also handles header text length issues by giving appropriate space to each column, rather than trying to force everything into a rigid structure.

Would you like me to detail how this would be implemented in the specific modules or refine any aspects of this approach?
