**Summarizing table formatting**
AI THINKING:
The user wants a textual description of the formatting for a table without any code. For the header row (B12\:O12), I’ll describe the font, size, color, alignment, cell fill, and any merged cells. For the first data row (B13\:O13), I’ll also outline specific formatting. Similarly, I'll summarize the label and title rows, detailing the formatting, alignment, and merging logic for their headers and any row borders involved, including Low Rating Alerts (rows 21 and 23).


Here’s a concise rundown of how each section of your dashboard is laid out and styled—based on your “Dashboard Cell Reference Documentation” (plus enhancement):

---

## Representative Performances Section

### Positioning Logic

* **Section title** sits in **B10** (merged B10\:H10).
* **Table header row** is **row 12**, spanning **B12\:O12**.
* **First data row** is **row 13**, spanning **B13\:O13**.
* The table always occupies rows 13–20 (8 rows), with two blank rows (21–22) before the next section.

### Header Row (Row 12: B12\:O12)

* **Merge/Cells**:

  * B12 (Sales Rep)
  * F12\:G12 (Responses)
  * H12\:J12 (Avg. Rating)
  * K12\:L12 (Low Rating)
  * N12\:O12 (5 Star Count)
* **Cell fill**: solid `#f8f9fa`, with only an **outside** border of `#dedede`.
* **Text**: bold, 10 pt, color `#666666`, **left-aligned**.
* **No inside borders** between columns—only the outer box.

### First Data Row (Row 13: B13\:O13)

> Note: The first is the same as all subsequent rows, except for the last one if the number of Sales Rep from our form data is more than 8 requiring the last one to be designated as 'others' in the Sales Rep column. 
> This is done so that format is not lost by the dynamic nature of table (based on the number Sales Rep) 

* **Merge/Cells** mirror the header:

  * B13 for the rep name
  * F13\:G13 for the response count
  * H13\:J13 for the average rating
  * K13\:L13 for the low-rating count
  * N13\:O13 for the 5-star count
* **Cell fill**: solid `#ffffff`, with an **outside** border of `#dedede`.
* **Text**: 10 pt, color `#000000`, **left-aligned**.
* **No inside borders**.

* **PS**: 
- Sales Rep header and data cell are left aligned
- Responses header and data cell are centered
- Avg. Rating header and data cell are centered
- Low Rating header and data cell are centered
- 5 Star Count header and data cell are centered
- If 'Others' as Sales Rep, then #b7b7b7 text color for the whole row in italic

---

## Low Rating Alerts Section

### Positioning Logic

* **Section title** sits exactly **three rows** below the rep table’s bottom: if rep data ends at row 20, title is at **row 23** (or if rep table is static to 20, place title at 23).
* **Header row** then would be two blank row further, at **row 25**, spanning **B25\:O25**. Obviously, this is subjet to last row of rep table being 20 and Low ranking section title row being 23.
* **First data row** would be **row 26**, spanning **B26\:O26**.
* The table can expand down to row 31 (up to 8 rows).

### Section Title (e.g. “Low Rating Alerts”)

* **Merge**: B23\:H23 (or whatever the computed title row is).
* **Text**: black, 17 pt, bold, **left-aligned**.
* **No borders** around the merged title cell.

### Header Row (Row 25: B25\:O25) {depending on position of title section}

* **Merge/Cells**:

  * B25\:C25 (Time)
  * D25\:F25 (Customer)
  * G25 (Rep)
  * I25\:J25 (Rating)
  * L25\:O25 (Issues)
* **Cell fill**: solid `#fee7e8`, with only an **outside** border of `#ec6759`.
* **Text**: bold, 10 pt, color `#c0392b`, **left-aligned**.
* **No inside borders**.

### First Data Row (Row 26: B26\:O26)

* **Merge/Cells**: same pattern as header—B26\:C26, D26\:F26, etc.
* **Cell fill**: solid `#fff5f5`, with only an **outside** border of `#ec6759`.
* **Text**: 10 pt, color `#c0392b`, **left-aligned**.
* **Number formatting** on the Time cell (B26\:C26) is set to **`h:mm:ss AM/PM`**, ensuring any Date-object is displayed as time only.
* **No inside borders**.

* **PS**: 
- Time header and data cell are left aligned
- Customer header and data cell are left aligned
- Rep header and data cell are centered
- Rating header and data cell are centered
- Issues header and data cell are left aligned

---

### Conditional “No data” Message

* If no low ratings, merge **B26\:F26** and display “No low ratings today!”

  * **Text**: color `#2e7d32`, 10 pt, **centered**.
  * **Cell fill**: solid `#fff5f5`, no borders.

---

By following these precise cell ranges, colors, fonts, borders and merge patterns, your scripted refresh will ensure the dynamic nature of tables to not loose its format while still allowing those tables to grow and shrink dynamically under script control.
