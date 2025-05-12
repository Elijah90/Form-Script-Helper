# ISSUE-FOCUS PROMPT  💡

> **🚀 Project Context (do not delete)**
>
> 1. **Dashboard layout contract**
>
>    * **Columns A → ?** are a shared *lane* for both the KPI tile block (rows 4-6) **and** the Representative-Performance table (starts at row 11).
>    * Column A is always the left edge.
>    * The *right* edge is **dynamic**: if the table needs extra width for merged headers, you **may add columns to the right of the current last KPI tile**.
>    * When you do add columns, also extend the KPI-tile merged ranges so their visual dimensions stay unchanged.
> 2. **Visual spec** (derived from mock-ups & `LayoutUtils.setColumnWidth` values)
>
>    * KPI tiles are three rows high:
>      • Row 4 → label (e.g., “Average Rating”)
>      • Row 5 → main value + secondary tag (“(out of 5.0)”, “33 % of total”, etc.)
>      • Row 6 → daily delta (“▲ 5 vs yesterday” or “▼ 0.1 vs yesterday”) – text & icon share one merged cell per tile.
>    * Representative table headers should line up under those columns, using merges that mirror mock-up proportions.
> 3. **Key modules**
>
>    * `DailyDash_New [KPI Titles].js` – draws KPI block.
>    * `DailyDash_New [LayoutUtils].js` – sets column widths & row heights. **These sizes are source-of-truth; infer pixel maths from here.**
>    * `DailyDash_New [Module Controller].js` – orchestrates build-order.
>    * Last stable commit **37f2d7e** shows a working state *before* Rep-table was added; use it for reference diffs.
>    * `dashboard_kpi_refactoring_summary.md` summarises Cursor’s recent edits that introduced the current mis-alignment.
> 4. **Coding guard-rails**
>
>    * Never shrink KPI columns; only extend rightward.
>    * Preserve existing colour logic for deltas (green up, red down).
>    * Use helper setters in `LayoutUtils` rather than hard-coding pixel numbers again.
>    * Keep code snippets minimal; if > 30 LOC, supply a diff or patch block instead of pasting whole files.
>    * Ask clarifying questions **only** if the issue statement below is ambiguous.
>
> ---
>
> **🔶   SPECIFIC ISSUE TO FIX / FEATURE TO ADD**
> Refer to Prompt
>
> ---
>
> **Deliverables**
>
> * A concise plan (bulleted) explaining what will change and *why*.
> * The patch / diff for affected module(s).
> * A one-sentence rollback tip (“Revert commit X or reset to tag stable-kpi-v3”).
> * (Optional) A sanity-check note if you detect that this issue has already been resolved in current files.
