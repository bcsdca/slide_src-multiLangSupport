//split by number of lines per page, like l(6) passing in
//# of lines required for each verse passing in is calculated by the number of chars in each verse
//and divide it by number of characters per line(16, for calibri 55 fonts)
//called by passage_2_ss1 function
//p_in is the invo/scripture array to scan
//mostly used for invo/scripture reading section
//each page on allowed l(6) lines of verses
/*
function splitByLine(p_in) {
  
  var temp_array = [];
  //for all pages return
  var temp1_array = [];

  var passage_in = p_in
  var my_i = 0;
  
  //running total lines per page
  var rt_l_per_page = 0;
  for (var my_i = 0; (my_i < passage_in.length); my_i++) {
    //always round up the next integer
    l_per_passage = Math.ceil(passage_in[my_i].length/chars_per_line);
    rt_l_per_page = rt_l_per_page + l_per_passage;
    logMessage(getCallStackTrace() + ": This verse " + my_i + "'s length is " + passage_in[my_i].length + ", with the content of " + passage_in[my_i] + ", and the number of line it used up = " + l_per_passage);
    //maxLinePerSlide is global variable 
    if (rt_l_per_page <= maxLinePerSlide) {
      temp_array.push(passage_in[my_i])
      logMessage(getCallStackTrace() + ": Putting this verse " + my_i + " to the temp array: " + temp_array + ", with the running total number of lines " + rt_l_per_page);
    }
    else {
      //this is starting of a new page, after fill up the last page with the max number of lines
      logMessage(getCallStackTrace() + ": Passage for this page = " + temp_array.join("\n") + ", Number of lines for this page is " + (rt_l_per_page - l_per_passage));
      temp1_array.push(temp_array.join("\n"))

      //reset per page info for the next page
      rt_l_per_page = l_per_passage;
      temp_array = [];
      temp_array.push(passage_in[my_i])
      logMessage(getCallStackTrace() + ": Starting a new page!!! Putting this verse " + my_i + ", to the array: " + temp_array + ", with the running total number lines of " + rt_l_per_page);
    }


  }
  //this is the last page
  temp1_array.push(temp_array.join("\n"))
  logMessage(getCallStackTrace() + ": This is passage array return, after splitting all up by lines " + temp1_array );
  return temp1_array
}
*/