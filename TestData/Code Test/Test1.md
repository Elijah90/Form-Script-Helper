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
11:27:55 AM	Notice	Execution started
11:27:57 AM	Info	• A: 90px
11:27:57 AM	Info	• B: 140px
11:27:57 AM	Info	• C: 30px
11:27:57 AM	Info	• D: 90px
11:27:58 AM	Info	• E: 140px
11:27:58 AM	Info	• F: 30px
11:27:59 AM	Info	• G: 90px
11:27:59 AM	Info	• H: 140px
11:27:59 AM	Info	• I: 30px
11:27:59 AM	Info	• J: 90px
11:27:59 AM	Info	• K: 140px
11:27:59 AM	Info	• L: 110px
11:28:00 AM	Info	• M: 190px
11:28:00 AM	Info	• N: 110px
11:28:00 AM	Info	• O: 175px
11:28:00 AM	Info	• P: 175px
11:28:00 AM	Info	• Q: 110px
11:28:00 AM	Info	• R: 190px
11:28:00 AM	Info	• S: 110px
11:28:00 AM	Info	• T: 43px
11:28:00 AM	Notice	Execution completed
```
