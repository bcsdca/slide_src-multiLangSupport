function createPassageUsingJSONBible(p, languageChosen, fontProfile) {

  try {

    // Load data from the spreadsheet.
    let dataRange = SpreadsheetApp.getActive().getSheetByName("passage").getDataRange();
    let sheet = SpreadsheetApp.getActive().getSheetByName("passage");
    var lastRow = dataRange.getLastRow();

    logMessage(getCallStackTrace() + ": Last Row at the start of the program = " + lastRow);
   
    //deleting all rows in one API call
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      logMessage(getCallStackTrace() + `: Cleared all rows from 2 to ${lastRow}`);
    }
    
    dataRange = SpreadsheetApp.getActive().getSheetByName("passage").getDataRange();
    lastRow = dataRange.getLastRow();
    logMessage(getCallStackTrace() + ": Last Row after all clean up spreadsheet = " + lastRow);

    //row = 1  is the Row Title
    //extractPassageUsingLocalBible will add 1 to passage_start_row_to_insert before it do the insert
    var passage_start_row_to_insert = 1;

    //extractBilingualPassage(passageInput, sheet, startingRow, languageChosen, provider, usingJSONBible)
    //provider input is needed only if we are not json bible to extract passage
    //povider input is used to decide which AI to used to extract bible passage
    //"deepseek" is just a place holder here
    //forcing usingJSONBible = true
    const PassageRowsUsed = extractBilingualPassage(p, sheet, passage_start_row_to_insert, languageChosen, "deepseek", true, fontProfile);
    logMessage(`${getCallStackTrace()}: PassageRowsUsed = ${PassageRowsUsed}, for inserting passage ${JSON.stringify(p, null, 2)}`);

    //then create the scripture passage ppt
    //p is the passage name "出埃及記 2:7-9" for create the file name in createPassageSlide function
    createPassageSlide(p, fontProfile);

  } catch (err) {
    const stackTrace = err.stack || "No stack trace available";

    const errorMessage =
      `Sorry, encountered an error in  running ${getCallStackTrace()} and program stopped !!!\n` +
      'Error message: ' + err.message + '\n' +
      'Stack trace:\n' + stackTrace;

    logMessageError(getCallStackTrace() + ': ' + errorMessage);

    SpreadsheetApp.getActive().toast(
      'Sorry, encountering an error in filling the sheet "passage" and program stopped !!!',
      '👎'
    );

    throw new Error(errorMessage); // ✅ FailureHandler WILL catch this
  }

}