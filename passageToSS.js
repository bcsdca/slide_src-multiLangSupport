function passageToSS(p_t, p, r_p,s) {
  //working on the scripture reading/invocation section of the spreadsheet
  //s is the sheet name
  var temp_passage_array = [];
  var my_passage_array = p;
 
  var my_j = 0;
  //p_t is the passage title
  var rows_used_up = 0;
  // curr_row point to exact row to start inserting passage
  var curr_row = r_p;

  let sheet = SpreadsheetApp.getActive().getSheetByName(s);
  
  logMessage(`${getCallStackTrace()}: starting row to insert passage = ${curr_row}`);
  
  //splitByLine is using maxLinePerSlide = 8 defined in the global variable
  temp_passage_array = splitByLine(my_passage_array);
  for (my_j = 0; my_j < temp_passage_array.length; my_j++) {
    logMessage(`${getCallStackTrace()}: Entering this scripture reading/invocation passage = ${temp_passage_array[my_j]} to spread sheet row ${curr_row}`);
    
    data = [p_t, temp_passage_array[my_j], Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd-HH:mm:ss')];
    logMessage(`${getCallStackTrace()}: scripture reading data to populate the spreadsheet = ${JSON.stringify(data)}`);
    sheet.insertRowAfter(curr_row);
    rows_used_up++;
    outerArray = [];//Assign empty array to variable name
    outerArray.push(data);
    sheet.getRange(curr_row + 1, 1, 1, 3).setBackground('white').setFontColor("black").setValues(outerArray);
    curr_row++;
  }
logMessage(`${getCallStackTrace()}: The number of rows used up in ss = ${rows_used_up}`);
return (rows_used_up)
}

