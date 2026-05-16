function dumpArray(a) {
  for (i=0; i < a.length; i++) {
    logMessage(getCallStackTrace() + `: index = ${i}, entry = ${a[i]}`)
  }
}
