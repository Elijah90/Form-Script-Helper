# ISSUE-FOCUS PROMPT FOR REPRESENTATIVE TABLE 💡

> **🚀 Project Context (do not delete)**
>
> 1. **Dashboard layout contract**
>
>    * **Columns A → K** are a shared *lane* for both the KPI tile block (rows 4-6) **and** the Representative-Performance table (starts at row 11).
>    * The table headers need to be properly aligned with the KPI tiles above them.
>    * Table headers should use merged cells to create appropriate column widths while maintaining the overall table width.
>    * Background color should be consistent between sections with no white space gaps.
>
> 2. **Table visual spec**
>
>    * Table starts at row 11 with a section header "Representative Performance"
>    * Row 12 contains column headers that should be merged to create appropriate widths
>    * Headers should include: "Sales Rep", "Responses", "Avg Rating", "Low Ratings", "5-Star Count"
>    * Data rows should align with the header structure
>    * Table container should have a white background with border
>
> 3. **Key modules**
>
>    * `DailyDash_New [TablesModule].js` – creates and formats the representative performance table
>    * `DailyDash_New [DataProcessing].js` – processes form data for the table
>    * `DailyDash_New [LayoutUtils].js` – contains column width settings that table should respect
>
> 4. **Coding guard-rails**
>
>    * Maintain consistent background color throughout the dashboard
>    * Ensure proper spacing between KPI tiles and table (no extra white space)
>    * Use helper functions in LayoutUtils for formatting consistency
>    * Table headers should be properly merged to create appropriate column widths
>    * Table should span the same total width as the KPI tiles above
>
> ---
>
> **🔶 SPECIFIC ISSUE TO FIX**
>
> The Representative Performance table has several issues that need to be fixed:
>
> 1. Table headers are too restrictive with current column widths
> 2. Background color is not applying correctly between KPI tiles and table
> 3. Table structure needs to be aligned with KPI tiles above
>
> ---
>
> **Deliverables**
>
> * A concise plan explaining the table header structure and how it will align with KPI tiles
> * Updates to the TablesModule.js file to implement proper header merging and alignment
> * Fixes for the background color issues between sections
> * A one-sentence rollback tip if the changes don't work as expected
