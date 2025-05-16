# Test Performed by User

## Test 1

### Code

```javascript
function logColumnWidths() {
  // Explicitly get the sheet by name "DailyDash"
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DailyDash');
  if (!sheet) {
    Logger.log('Sheet "DailyDash" not found!');
    return;
  }
  
  // Optional: Get the total number of columns in the sheet.
  var totalCols = sheet.getMaxColumns();
  
  // We'll log columns A to T (1 to 20), but ensure we're not going beyond what exists.
  var endCol = Math.min(20, totalCols);
  
  // Loop through each column and log its width.
  for (var col = 1; col <= endCol; col++) {
    var width = sheet.getColumnWidth(col);
    var colLetter = String.fromCharCode(64 + col); // Converts 1->A, 2->B, etc.
    Logger.log("• " + colLetter + ": " + width + "px");
  }
}

```

### Log Output

```log
12:16:50 PM	Notice	Execution started
12:16:51 PM	Info	• A: 110px
12:16:51 PM	Info	• B: 110px
12:16:51 PM	Info	• C: 190px
12:16:51 PM	Info	• D: 110px
12:16:51 PM	Info	• E: 30px
12:16:51 PM	Info	• F: 110px
12:16:51 PM	Info	• G: 110px
12:16:51 PM	Info	• H: 190px
12:16:51 PM	Info	• I: 110px
12:16:51 PM	Info	• J: 30px
12:16:52 PM	Info	• K: 110px
12:16:52 PM	Info	• L: 110px
12:16:52 PM	Info	• M: 190px
12:16:52 PM	Info	• N: 110px
12:16:52 PM	Info	• O: 30px
12:16:52 PM	Info	• P: 110px
12:16:52 PM	Info	• Q: 110px
12:16:52 PM	Info	• R: 190px
12:16:52 PM	Info	• S: 110px
12:16:52 PM	Info	• T: 60px
12:16:53 PM	Notice	Execution completed
```
