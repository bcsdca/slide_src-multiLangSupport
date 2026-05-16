function extractNameChapterVerse(index, str) {
  //var str = "馬太福音Matthew18:15-20 ";
  //var index = 13;

  var chapter = "";
  var name = "";
  var nameEndIndex = 0;
  var returnArray = [];

  // Loop backward from the index to find the digits
  for (var i = index - 1; i >= 0; i--) {
    if (isDigit(str[i])) {
      chapter = str[i] + chapter;
    } else {
      nameEndIndex = i + 1;
      // Stop when the first non-digit character is found
      break;
    }
  }

  name = str.substring(0, nameEndIndex);
  verse = str.substring(index + 1);

  //there is a colon, but no chapter number before it, so check if it is single chapter book else error condition
  if (chapter == "") {
    if (name.match(/腓利門書|約翰二書|約翰三書|猶大書|俄巴底亞書/)) {
      chapter = 1;
      logMessage(`${getCallStackTrace()}: This is single book chapter is \"${name}\"`)
    } else {
      logMessageError(`${getCallStackTrace()}: Error!!! there is no chapter info for \"${name}\"`)
    }
    
  } 
          
  returnArray.push(name);
  returnArray.push(chapter);
  returnArray.push(verse);
  
  logMessage(`${getCallStackTrace()}: The book name, book chapter, verse info is ${JSON.stringify(returnArray)}`)
  return returnArray;
}
