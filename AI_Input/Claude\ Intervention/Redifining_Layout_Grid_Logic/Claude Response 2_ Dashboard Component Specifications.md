# Dashboard Component Specifications

Based on the images and code review, here are the detailed specifications for the KPI tiles and table structure:

## KPI Tiles Specifications

### Column Structure for Tiles

- **Total KPI Width**: 230px (each tile)
- **Column Layout**:
  - **First Cell Width**: 90px (column A, D, G, J)
  - **Second Cell Width**: 140px (column B, E, H, K)
  - **Spacer Width**: 30px (column C, F, I)

### Row Structure (Each KPI Tile)

- **Title Row**: Height 25px (row 4)
  - Merged across 2 columns
  - Left-aligned text
  - Font size 14px, color #666666

- **Value Row**: Height 50px (row 5)
  - Two cells side by side:
    - First cell: Main value (large number, 36px, bold)
    - Second cell: Secondary info (if needed)
      - For "Average Rating": "(out of 5.0)"
      - For "5-Star Ratings": "X% of total"
  - Yellow highlight for Average Rating

- **Change Indicator Row**: Height 25px (row 6)
  - Merged across 2 columns
  - Contains: "▲/▼ [value] vs. yesterday"
  - Green color for positive, red for negative
  - For "% Negative Cases": Note contains "Action needed: X cases"

### Merge Pattern (Tiles)

```markdown
+----------------+----------------+
|      Title (merged)             |
+----------------+----------------+
| Main Value     | Secondary Info |
+----------------+----------------+
|      Change Indicator (merged)  |
+----------------+----------------+
```

## Table Specifications

### Column Structure for Table

- **Total Width**: Same as KPIs (columns A-K)
- **Matches KPI Positions**:
  - Columns A-B: "Sales Rep"
  - Columns D-E: "Performance Metrics"
  - Columns G-H: "Milestone Progress"
  - Columns J-K: "Rewards & Negatives"
- **Spacer Columns**: Same as KPIs (C, F, I)

### Row Structure

- **Section Header**: "Representative Performance" (row 10)
  - Merged across all columns A-K
  - Font size 16px, bold

- **Column Headers**: (row 11)
  - 4 merged cells matching KPI positions
  - Background color #f1f3f4
  - Center-aligned, bold text

- **Data Rows**: Each representative (row 12+)
  - Background color based on performance:
    - Good (>= 4.5): Light green (#E8F5E9)
    - Medium (>= 3.5): Light yellow (#FFF8E1)
    - Poor (< 3.5): Light red (#FFEBEE)
  - Height: 40px for each row

### Data Cell Content

- **Sales Rep**: Rep name
- **Performance Metrics**: Multiple lines of info:

  ```markdown
  Responses: XXX
  Avg Rating: X.X
  5★: X / XX
  ```

- **Milestone Progress**: Progress bar with text (X/XX ★)
- **Rewards & Negatives**: Two lines:

  ```markdown
  Rewards: £XXX (earned)
  Negatives: XX
  ```

### Merge Pattern (Table)

```markdown
+----------------+----------------+
|      Section Title (merged across all columns)     |
+----------------+----------------+----------------+----------------+
| Sales Rep      | Performance   | Milestone      | Rewards &      |
| (merged)       | Metrics (mrg) | Progress (mrg) | Negatives (mrg)|
+----------------+----------------+----------------+----------------+
| Rep Name       | Multi-line    | Progress Bar   | Rewards and    |
| (merged)       | Metrics (mrg) | (merged)       | Negatives (mrg)|
+----------------+----------------+----------------+----------------+
```

## Key Implementation Points

1. **Grid System Requirements**:
   - Must maintain fixed widths for all columns (based on values above)
   - Spacer columns must stay at 30px width
   - Total dashboard width is 980px (230px × 4 tiles + 30px × 3 spacers)

2. **Merging Requirements**:
   - All merges must be recreated each time the dashboard refreshes
   - Most elements require proper merging to display correctly
   - Table headers must align perfectly with KPI tile positions

3. **Content Rendering**:
   - KPI values must properly handle different data formats
   - Change indicators need dynamic color coding
   - Table cells need multi-line formatting
   - Progress bars need visual representation

These specifications can serve as the foundation for the new container-based layout system that we discussed.
