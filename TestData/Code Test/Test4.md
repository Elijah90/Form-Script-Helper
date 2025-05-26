# Test Performed by User

## Test 4

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
7:13:42 PM	Notice	Execution started
7:13:42 PM	Info	• A: 110px
7:13:42 PM	Info	• B: 120px
7:13:42 PM	Info	• C: 30px
7:13:43 PM	Info	• D: 110px
7:13:43 PM	Info	• E: 120px
7:13:43 PM	Info	• F: 30px
7:13:43 PM	Info	• G: 110px
7:13:43 PM	Info	• H: 120px
7:13:43 PM	Info	• I: 30px
7:13:43 PM	Info	• J: 110px
7:13:43 PM	Info	• K: 120px
7:13:43 PM	Info	• L: 110px
7:13:43 PM	Info	• M: 175px
7:13:43 PM	Info	• N: 175px
7:13:43 PM	Info	• O: 30px
7:13:43 PM	Info	• P: 110px
7:13:43 PM	Info	• Q: 110px
7:13:43 PM	Info	• R: 190px
7:13:43 PM	Info	• S: 110px
7:13:43 PM	Info	• T: 60px
7:13:44 PM	Notice	Execution completed
```
