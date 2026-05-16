function extractLastDigitPosition(str) {
  //var str = "8-12.,";
  //can't find digit on the whole string
  var lastIndex = -1;

  // Iterate backwards through the string
  for (var i = str.length - 1; i >= 0; i--) {
    if (/\d/.test(str[i])) {
      lastIndex = i;
      break;
    }
  }
  logMessage(`${getCallStackTrace()}: The last digit position(counting from the beginning) before the end of string = ${lastIndex}, with the digit of \"${str[i]}\"`)
  return lastIndex
}