I still have this below issue log error  when I run and same issue for KPI tiles (first tile appearing merge over row 4, 5, 6 and column A,B)  while remiander of tiles don't even exist any more.
"""
8:49:01 PM	Notice	Execution started
8:49:02 PM	Error	
You must select all cells in a merged range to merge or unmerge them.
"""

However when I press refresh button it give me attahced
And when I run agian the 'testKPITilesWithContainers' function after that no issue now.

So the only thing I guess need some update the background colour of the dashboard that sholdnt be the same as the background colour of the tiles. Tiles container should have background white before data or other display are added to the container so that if there is no colour fill like the yelow in average rating the background would be white contrasting with the background colour of the dashboard
Also the tiles should have a black border colour but rather something like mdeium light grey (darker than the dashboard background) 

See how it is now 'DailyDash1_@_SeeminglySucceed.png' and a pervious aspect of the dashboard 'DailyDash1_@_ErrorKPIZoomed_AfterImplementig_NewLayoutLogic.png' which offer a visual contrast with now about the issue I mentioed