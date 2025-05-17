Okay see attached screenshot of the dashboard after running 'testKPITilesWithContainers' with below correspnding execution log:
"""
Execution log
7:52:35 PM	Notice	Execution started
7:52:35 PM	Error	
TypeError: changeCell.clearContent(...).clearDataValidations(...).clearNote(...).unmerge is not a function
formatKpiValueWithChange	@ DailyDash_New [LayoutUtils].gs:545
createSimpleKPITile	@ DailyDash_New [KPI Titles].gs:225
testKPITilesWithContainers	@ DailyDash_New [KPI Titles].gs:314
"""

Note the screnshots names are selfexplainatory

Also additionally, see below the execution log for the refresh button or 'refreshDashboard' function:
"""
Cloud logs
May 15, 2025, 7:54:29 PM	Info	DEBUG: Starting dashboard refresh process
May 15, 2025, 7:54:29 PM	Info	DEBUG: About to get data source sheet name
May 15, 2025, 7:54:29 PM	Info	DEBUG: Data source retrieved: TestData
May 15, 2025, 7:54:29 PM	Info	Starting dashboard refresh with data source: TestData
May 15, 2025, 7:54:29 PM	Info	DEBUG: Formatting dashboard background
May 15, 2025, 7:54:30 PM	Info	DEBUG: About to set data source sheet
May 15, 2025, 7:54:30 PM	Info	DEBUG: About to create dashboard header
May 15, 2025, 7:54:30 PM	Info	Header refreshed. Next row: 4
May 15, 2025, 7:54:30 PM	Info	DEBUG: About to create KPI tiles
May 15, 2025, 7:54:30 PM	Info	DEBUG: Starting createKPITiles function
May 15, 2025, 7:54:30 PM	Info	DEBUG: About to get data source sheet name
May 15, 2025, 7:54:30 PM	Info	DEBUG: Data sheet name: TestData
May 15, 2025, 7:54:32 PM	Info	Error creating KPI tile Submissions Today: changeCell.clearContent(...).clearDataValidations(...).clearNote(...).unmerge is not a function
May 15, 2025, 7:54:32 PM	Info	Error creating KPI tile Average Rating: changeCell.clearContent(...).clearDataValidations(...).clearNote(...).unmerge is not a function
May 15, 2025, 7:54:32 PM	Info	Error creating KPI tile 5-Star Ratings: changeCell.clearContent(...).clearDataValidations(...).clearNote(...).unmerge is not a function
May 15, 2025, 7:54:32 PM	Info	Error creating KPI tile % Negative Cases: changeCell.clearContent(...).clearDataValidations(...).clearNote(...).unmerge is not a function
May 15, 2025, 7:54:32 PM	Info	KPI tiles refreshed. Next row: 7
May 15, 2025, 7:54:32 PM	Info	DEBUG: About to create Rep Performance table
May 15, 2025, 7:54:32 PM	Info	Creating Representative Performance table
May 15, 2025, 7:54:34 PM	Info	Rep Performance table refreshed. Next row: 21
May 15, 2025, 7:54:34 PM	Info	Dashboard refresh completed successfully.
"""

Check, describe and fix!