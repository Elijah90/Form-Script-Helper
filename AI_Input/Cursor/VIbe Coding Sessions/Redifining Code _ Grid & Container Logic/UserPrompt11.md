okay I still have issue wiht this. Now, no matter whether I run the 'testKPITilesWithContainers' function or I press the refresh button it is still stuck at the same view we have in screenshot 'DailyDash1_@_AfterRefreshButton.png'
SEe below execution logs
• EXECUTION LOG FOR 'testKPITilesWithContainers' FUNCTION:
"""
Execution log
8:41:18 PM	Notice	Execution started
8:41:19 PM	Error	
You must select all cells in a merged range to merge or unmerge them.
"""

• EXECUTION LOG FOR "refreshDashboard" FUNCTION:
"""
Cloud logs
May 15, 2025, 8:37:09 PM	Info	DEBUG: Starting dashboard refresh process
May 15, 2025, 8:37:09 PM	Info	DEBUG: About to get data source sheet name
May 15, 2025, 8:37:09 PM	Info	DEBUG: Data source retrieved: TestData
May 15, 2025, 8:37:09 PM	Info	Starting dashboard refresh with data source: TestData
May 15, 2025, 8:37:09 PM	Info	DEBUG: Formatting dashboard background
May 15, 2025, 8:37:09 PM	Info	DEBUG: About to set data source sheet
May 15, 2025, 8:37:09 PM	Info	DEBUG: About to create dashboard header
May 15, 2025, 8:37:09 PM	Info	Header refreshed. Next row: 4
May 15, 2025, 8:37:09 PM	Info	DEBUG: About to create KPI tiles
May 15, 2025, 8:37:09 PM	Info	DEBUG: Starting createKPITiles function
May 15, 2025, 8:37:09 PM	Info	DEBUG: About to get data source sheet name
May 15, 2025, 8:37:09 PM	Info	DEBUG: Data sheet name: TestData
May 15, 2025, 8:37:11 PM	Info	KPI tiles refreshed. Next row: 7
May 15, 2025, 8:37:11 PM	Info	DEBUG: About to create Rep Performance table
May 15, 2025, 8:37:11 PM	Info	Creating Representative Performance table
May 15, 2025, 8:37:12 PM	Info	Rep Performance table refreshed. Next row: 21
May 15, 2025, 8:37:12 PM	Info	Dashboard refresh completed successfully.
"""