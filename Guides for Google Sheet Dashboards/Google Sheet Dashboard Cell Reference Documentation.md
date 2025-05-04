# Google Sheets Dashboard Cell Reference Documentation

## Header Section

-   **Dashboard Title**:
    
    -   Merge Range: Row 1, Column A to O
    -   True Data Cell: A1
    -   Content: "Daily Performance Dashboard"
    -   Text Formatting: Arial, #000000, centered, large font (24pt), bold
    -   Cells Formatting: #ffffff, no borders
-   **Refresh Data Button**:
    
    -   Position: Overlapping button element in cell A1 area
    -   Text Formatting: Blue button filled blue (#cfe2f3ff) with white text, rounded corners
    - Button Formatting: 
-   **Last Updated Message**:
    
    -   Merge Range: Row 2, Column A to O
    -   True Data Cell: A2
    -   Content: "Last updated: May 01, 2025 11:09 PM" || {Generic Content = "Last updated: [This will be auto-updated]"}
    -   Text Formatting: Colour #a9b1d6, # centered, small font (approx. 12pt)
    -   Cells Formatting: #ffffff, no borders

## KPI Section (Key Performance Indicators)

### Today's Responses

-   **Label Box**:
    
    -   Merge Range: Row 4, Column B to D
    -   True Data Cell: B4
    -   Content: "Today's Responses"
    -   Text Formatting: Colour #808c8d, bold centered text
-   **Value Box**:
    
    -   Merge Range: Row 5 to 6, Column B to D
    -   True Data Cell: B5
    -   Content: "12"
    -   Text Formatting:  centered, large black font (36pt), bold

-   **Value &  Label as one visual Box**:
    -   Box/cells Formatting: fill colour #f7f7f7, border colour #3498dc; Visual box & Border scope: row 4 to 7, column B to D.

### Average Rating

-   **Label Box**:
       
    -   Merge Range: Row 4, Column F to H 
    -   True Data Cell: B4
    -   Content: "Average Rating"
    -   Text Formatting: Colour #808c8d, bold centered text
-   **Value Box**:
    
    -   Merge Range: Row 5 to 6, Column F to H
    -   True Data Cell: F5
    -   Content: "3.8"
    -   Text Formatting:  centered, large black font (36pt), bold
-   **Comment OR Variation Text**:
    
    -   Merge Range: Row 7, Column F to H
    -   True Data Cell: F7
    -   Content: "↑ 0.3 from yesterday"
    -   Text Formatting: Colour #2fcc71, centered, 10pt

-   **Value &  Label as one visual Box**:
    -   Box/cells Formatting: fill colour #f7f7f7, border colour #2fcc71; Visual box & Border scope: row 4 to 7, column F to H

### Low Ratings (< 3)

-   **Label Box**:
    
    -   Merge Range: Row 4, Column J to L
    -   True Data Cell: J4
    -   Content: "Low Ratings (< 3)"
    -   Text Formatting: Colour #808c8d, bold, centered text

-   **Value Box**:    
    -   Merge Range: Row 5 to 6, Column J to L
    -   True Data Cell: J5
    -   Content: "3"
    -   Text Formatting:  centered, large red (#e74c3d) font (36pt),  bold

-   **Note Box**:
    -   Merge Range: Row 7, Column J to L
    -   True Data Cell: J7
    -   Content: "Need attention"
    -   Text Formatting: Colour #e74c3d, centered, 10pt

-   **Value &  Label as one visual Box**:
    -   Box/cells Formatting: fill colour #fff5f5, border colour #e74c3d; Visual box & Border scope: row 4 to 7, column J to L

### 5-Star Count

-   **Label Box**:
    
    -   Merge Range: Row 4, Column N to O
    -   True Data Cell: N4
    -   Content: "5-Star Count"
    -   Text Formatting: Colour #808c8d, bold, centered text
-   **Value Box**:
    
    -   Merge Range: Row 5 to 6, Column N to O
    -   True Data Cell: N5
    -   Content: "4"
    -   Formatting: Centered, large orange/gold (#f39c13) font (36 pt), bold

-   **Value &  Label as one visual Box**:
    -   Box/cells Formatting: fill colour #f7f7f7, border colour #f39c13; Visual box & Border scope: row 4 to 7, column N to O

## Representative Performances Section

-   **Section Title**:
    
    -   Merge Range: Row 10, Column B to H
    -   True Data Cell: B10
    -   Content: "Representative Performances"
    -   Formatting: Black, 17pt, bold, left-aligned
-   **Table Headers (Row 12)**:
    
    -   Sales Rep: Cell B12
	    -   Column Data Cells: Row 13 to 18 , Column B (B13, B14, B15, B16, B17, B18)
    -   Responses: Merge Range: Row 12, Column F to G (True Data Cell: F12)
    -   Avg. Rating: Merge Range: Row 12, Column H to J (True Data Cell: H12)
    -   Low Rating: Merge Range: Row 12, Column K to L (True Data Cell: K12)
    -   5 Star Count: Merge Range: Row 12, Column N to O (True Data Cell: N12)

-   **Table Data (Per initial set up: Row 13, 14, 15, 16, 17, and 18)**:

    -   Sales Rep Column Data Cells: Row 13 14, 15, 16, 17, and 18 , Column B (B13, B14, B15, B16, B17 and B18)
    -   Responses Column Data Cells: Merge Range: Row 13, 14, 15, 16, 17, and 18, Column F to G (True Data Cells: F13, F14, F15, F16, F17 and F18)
    -   Avg. Rating Column Data Cells: Merge Range: Row 13, 14, 15, 16, 17, and 18, Column H to J (True Data Cells: H13, H14, H15, H16, H17 and H18)
    -   Low Rating Column Data Cells: Merge Range: Row 13, 14, 15, 16, 17, and 18 Column K to L (True Data Cells: K13, K14, K15, K15, K16, K17 and K18)
    -   5 Star Count Column Data Cells: Merge Range: Row 13, 14, 15, 16, 17, and 18, Column N to O (True Data Cells: N13, N14, N15, N16, N17 and N18)

-   **Format header row**: 
	- Cell Formatting: From Column B to O + row12, filled colour #f8f9fa, only outside border colour #dedede, no inside borders.
	- Text Formatting: Text bold 10pt, left-aligned, color #666666.

-   **Format data rows**: 
	- Cell Formatting: For each of row individually (13, 14, 15, 16, 17 and 18) + From Column B to O, filled colour #ffffff, only outside border colour #dedede, no inside borders.
	- Text Formatting: Text 10pt, left-aligned, color #000000.


## Low Rating Alerts Section

-   **Section Title**:
    
    -   Merge Range: Row 21, Column B to H.
    -   True Data Cell: B21
    -   Content: "Low Rating Alerts"
    -   Formatting: Black, 17pt, bold, left-aligned.
-   **Table Headers (Row 23)**:
    
    -   Time: Merge Range: Row 23, Column B to C (True Data Cell: B23).
    -   Customer: Merge Range: Row 23, Column D to F (True Data Cell: D23).
    -   Rep: Cell G23.
    -   Rating: Merge Range: Row 23, Column I to J (True Data Cell: I23).
    -   Issues: Merge Range: Row 23, Column L to O (True Data Cell: L23).

-   **Table Column Data (Row 24, 25 and 26)**:
    
    -   Time: Merge Range: Row 24, 25 and 26; Column B to C (True Data Cell: B24, B25 and B26).
    -   Customer: Merge Range: Row 24, 25 and 26; Column D to F (True Data Cell: D24, D25 and D26).
    -   Rep: Cell G24, G25 and G26
    -   Rating: Merge Range: Row 24, 25 and 26; Column I to J (True Data Cell: I24, I25 and I26).
    -   Issues: Merge Range: Row 24, 25 and 26; Column L to O (True Data Cells: L24, L25, L26).
-   **Format header row**: 
	- Cell Formatting: From Column B to O + row23, filled colour #fee7e8, only outside border colour #ec6759, no inside borders. 
	- Text Formatting: Text bold 10pt, left-aligned, color #c0392b.

-   **Format data rows**: 
	- Cell Formatting: For each of row individually (24, 25 and 26) + From Column B to O, filled colour #fff5f5, only outside border colour #ec6759, no inside borders, 
	- Text Formatting: Text 10pt, left-aligned, color #c0392b


## Conditional Display Logic Notes

-   When no low ratings exist: Display message "No low ratings today!" in Merge Range: Row 24, Column B to F (Data Cell: B24). Colour #2e7d32, font 10pt.
-   When low rating exist but previous refresh lacked low rating data and provided 'No low ratings today!' as it merged from column B to F on row 24, remove message , revert to original cells formatting (B24:C24 for the data of column 'Time' and D24:E24 for the data of column 'Customer')and display low rating data in the same row and if necessary for below rows as well.
-   Empty state handling for KPIs should display either blank or "0" rather than placeholder values
-   For "Average Rating" variation text, when no comparison data is available--in order words no data for the current day-- should be blank or display appropriate message
