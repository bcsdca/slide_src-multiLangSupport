/**
 * Returns the bibleBooks object for client-side use, like in the htmlPassage.html file
 */
function getChineseBibleBookInfo() {
  
  //chineseToEnglishMap existed on globalVarSlideSrcAllAPI
  //const chineseToEnglishMap = Object.fromEntries(
  //  Object.entries(bibleBookMap).map(([eng, chi]) => [chi, eng])
  //);

  // existed in globalVarSlideSrcAllAPI
  logMessage(`${getCallStackTrace()}: The content of ChineseBibleBookOrder = ${JSON.stringify(ChineseBibleBookOrder)}`);
  logMessage(`${getCallStackTrace()}: The content of ChineseBibleEachChapterLength = ${JSON.stringify(ChineseBibleEachChapterLength)}`);
  logMessage(`${getCallStackTrace()}: The content of Chinese To English Book name = ${JSON.stringify(chineseToEnglishMap)}`);
  return { ChineseBibleBookOrder, ChineseBibleEachChapterLength, chineseToEnglishMap };
}

