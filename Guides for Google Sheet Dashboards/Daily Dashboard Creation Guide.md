# Daily Dashboard Creation Guide

## Step 1: Create the Dashboard Sheet
1. Open your Google Sheet
2. Click the "+" at the bottom to add a new sheet
3. Right-click the new sheet tab and rename it to "Daily Dashboard"

## Step 2: Set Up the Title and Header
1. Click on cell A1
2. Type: "Daily Performance Dashboard"
3. Format the title:
   - Font size: 24pt
   - Font: Arial (or your preferred font)
   - Bold: Yes
   - Center align
   - Merge cells A1:J1 (select A1:J1, then Format > Merge cells > Merge all)

4. In cell A2, type: "Last updated: [This will be auto-updated]"
5. Format A2:
   - Font size: 12pt
   - Color: Gray
   - Center align
   - Merge cells A2:J2

## Step 3: Create Key Metrics Cards (Row 4-7)

### Today's Responses Card
1. Merge cells B4:C4 for the title
2. In B4, type: "Today's Responses"
3. Format: Center align, gray text
4. Merge cells B5:C6 for the number
5. In B5, type: "12" (placeholder)
6. Format: Font size 36pt, Bold, Center align
7. Select B4:C7 and add borders (Format > Borders > All borders)
8. Fill color for B4:C7: Light blue (#E3F2FD)

### Average Rating Card
1. Merge cells D4:E4 for the title
2. In D4, type: "Average Rating"
3. Format: Center align, gray text
4. Merge cells D5:E6 for the number
5. In D5, type: "3.8" (placeholder)
6. Format: Font size 36pt, Bold, Center align
7. Merge cells D7:E7 for the trend
8. In D7, type: "↑ 0.3 from yesterday"
9. Format: Green text, Center align
10. Select D4:E7 and add borders
11. Fill color: Light green (#E8F5E9)

### Low Ratings Card
1. Merge cells F4:G4 for the title
2. In F4, type: "Low Ratings (<3)"
3. Format: Center align, gray text
4. Merge cells F5:G6 for the number
5. In F5, type: "3" (placeholder)
6. Format: Font size 36pt, Bold, Red text (#D32F2F), Center align
7. Merge cells F7:G7 for the message
8. In F7, type: "Needs attention"
9. Format: Red text, Center align
10. Select F4:G7 and add borders
11. Fill color: Light red (#FFEBEE)

### 5-Star Count Card
1. Merge cells H4:I4 for the title
2. In H4, type: "5-Star Count"
3. Format: Center align, gray text
4. Merge cells H5:I6 for the number
5. In H5, type: "4" (placeholder)
6. Format: Font size 36pt, Bold, Orange text (#F57F17), Center align
7. Select H4:I7 and add borders
8. Fill color: Light yellow (#FFF9C4)

## Step 4: Create Representative Performance Table (Row 9-15)

### Table Header
1. In A9, type: "Representative Performance"
2. Format A9:
   - Font size: 18pt
   - Bold
   - Color: Dark blue

### Create the table structure (Row 11-15)
1. Set up headers in row 11:
   - A11: "Sales Rep"
   - C11: "Responses" 
   - E11: "Avg Rating"
   - G11: "Low Ratings"
   - I11: "5-Star Count"

2. Format row 11:
   - Bold
   - Background color: Light gray (#F5F5F5)
   - Add bottom border

3. Add data rows (12-15):
   - Leave these cells empty for now (script will fill them)
   - Add borders to create a table look

## Step 5: Create Low Rating Alerts Section (Row 17-23)

### Section Header
1. In A17, type: "Low Rating Alerts"
2. Format:
   - Font size: 18pt
   - Bold
   - Color: Red (#D32F2F)

### Alert Table
1. Set up headers in row 19:
   - A19: "Time"
   - B19: "Customer"
   - D19: "Rep"
   - F19: "Rating"
   - G19: "Issue"

2. Format row 19:
   - Bold
   - Background: Light red (#FFCDD2)
   - Add borders

3. Create empty rows 20-23 for alerts
4. Apply light red background to the entire alert section

## Step 6: Apply Overall Formatting

### Column Widths
1. Adjust column widths:
   - Column A: 120 pixels
   - Columns B-I: 100 pixels each
   - Column J: 200 pixels (for longer text)

### Final Touches
1. Add gridlines where needed
2. Freeze row 3 (View > Freeze > Up to row 3)
3. Set zoom to 90% for better visibility

## Step 7: Name Important Cells for Script Updates

Select and name these cells (Data > Named ranges):
- B6: "daily_responses"
- D6: "daily_avg_rating"
- F6: "daily_low_ratings"
- H6: "daily_five_stars"
- A12:I15: "rep_performance_range"
- A20:G23: "alert_range"

## Tips for Success
- Save your formatting by creating a template
- Use consistent colors throughout
- Test with sample data before connecting the script
- Keep cell references consistent for script updates

## Color Reference Guide
- Blue: #E3F2FD (light), #2196F3 (accent)
- Green: #E8F5E9 (light), #4CAF50 (accent)
- Red: #FFEBEE (light), #D32F2F (accent)
- Yellow: #FFF9C4 (light), #F57F17 (accent)
- Gray: #F5F5F5 (light), #757575 (text)