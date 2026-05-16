function createPassageOnly(p) {
  //clearLogSheet();
  try {

    // Load data from the spreadsheet.
    let dataRange = SpreadsheetApp.getActive().getSheetByName("passage").getDataRange();
    let sheet = SpreadsheetApp.getActive().getSheetByName("passage");
    var lastRow = dataRange.getLastRow();

    logMessage(getCallStackTrace() + ": Last Row at the start of the program = " + lastRow);

    //only deleting all the passages in a backward manner
    //for (var i = 2; i <= lastRow; i++) {
    //always deleting the row 2, the rest will move up if there are more
    //  sheet.deleteRow(2);
    //  logMessage(getCallStackTrace() + `: deleting row ${i} `);
    //}
        
    //deleting all rows in one API call
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      logMessage(getCallStackTrace() + `: Cleared all rows from 2 to ${lastRow}`);
    }

    //if (lastRow > 1) {
    //  sheet.deleteRows(2, lastRow - 1);
    //  logMessage(getCallStackTrace() + `: Deleted rows 2 through ${lastRow}`);
    //}

    dataRange = SpreadsheetApp.getActive().getSheetByName("passage").getDataRange();
    lastRow = dataRange.getLastRow();
    logMessage(getCallStackTrace() + ": Last Row after all clean up spreadsheet = " + lastRow);

    //ss starting row to insert = 2, because the starting row =1  is the Row Title
    var passage_start_row_to_insert = 2;
    
    //deepseek AI is used to extract passage
    //passageOnlyAIProvider is deepseek setup in global variable file
    const PassageRowsUsed = extractPassageUsingAPI(p, sheet, passage_start_row_to_insert, passageOnlyAIProvider);
    logMessage(`${getCallStackTrace()}: PassageRowsUsed = ${PassageRowsUsed}, for inserting passage ${JSON.stringify(p, null, 2)}`);

    //then create the scripture passage ppt
    //p is the passage name "出埃及記 2:7-9" for create the file name in createPassageSlide function
    createPassageSlide(p);

  } catch (err) {
    logMessageError(getCallStackTrace() + ': Sorry, encountering some error in filling the sheet \"passage\" and program stopped !!! : ' + err);
    SpreadsheetApp.getActive().toast("Sorry, encountering some error in filling the sheet \"passage\" and program stopped !!!", "👎");

  }

}
