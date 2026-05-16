function extractDigitsBeforeIndex(index, str) {
  //var str = "馬太福音Matthew18:15-20";
  var digitsBeforeIndex = "";

  
  // Loop backward from the index to find the digits
  for (var i = index - 1; i >= 0; i--) {
    if (isDigit(str[i])) {
      digitsBeforeIndex = str[i] + digitsBeforeIndex;
    } else {
      // Stop when the first non-digit character is found
      break;
    }
  }

  logMessage(`${getCallStackTrace()}: Digits before the index = ${digitsBeforeIndex}`);
  return digitsBeforeIndex;
}
