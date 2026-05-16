function findColonIndex(str, char1, char2) {
  for (var i = 0; i < str.length; i++) {
    if (str[i] === char1 || str[i] === char2) {
      logMessage(`${getCallStackTrace()}: Finding colon index at position : ${i} of the string ${str}`);
      return i;
    }
  }
  logMessageError(`${getCallStackTrace()}: Not finding colon index for this string ${str}`);
  return -1;
}
