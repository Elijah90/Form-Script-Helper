
Read file: CODE/NEW/DailyDashboard_NewLogic1/DailyDash_New [LayoutUtils].js > L1-200


**Your KPI tiles now use a true "visual column" system:**

---

### **What was changed:**
- Each KPI tile is split into two "visual columns" (first: 38%, second: 62% of a max width, e.g., 300px).
- The code merges the appropriate number of Google Sheet columns to match these visual columns as closely as possible, regardless of how many actual columns are in the band.
- The main value and subtitle are placed in these visual columns, so the width of each is consistent across all tiles.
- The "Action needed" message for "% Negative Cases" is now a **cell note** on the change indicator, not visible text.

---

### **What to do next:**
- Refresh your dashboard or run the KPI test.
- You should see:
  - All KPI tiles have consistent visual column widths (main value and subtitle).
  - The max width for each tile is respected.
  - The "Action needed" message is only a cell note, not visible in the cell.

---

**Let me know if this finally resolves the visual column and width issues!  
If you want to further tweak the visual proportions or max width, just say so!**
