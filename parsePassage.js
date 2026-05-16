function parsePassage(passage) {
  var colonChar1 = ":";
  var colonChar2 = "：";
  var array_return = [];
  var bookName = "";
  var bookNameSave = "";
  var chapterNumberSave = "";

  for (var i = 0; i < passage.length; i++) {

    var str = passage[i].replace(/\s+/g, "");
    logMessage(`${getCallStackTrace()}: Working on this passage : ${str}`);

    var colonIndex = findColonIndex(str, colonChar1, colonChar2);
    if (colonIndex != -1) {
      // Extract the book name, chapter number, and verse info
      var nameChapterNumber = extractNameChapterVerse(colonIndex, str);

      var bookName = nameChapterNumber[0].replace(/[\x00-\x7F]/g, "");
      var chapterNumber = nameChapterNumber[1];
      var verseNumberTemp = nameChapterNumber[2];

      // Remove everything in parentheses
      verseNumberTemp = verseNumberTemp.replace(/\(.*?\)/g, '');
     
      // Remove all non-digit at the end of verseNumberTemp
      var lastDigitPosition = extractLastDigitPosition(verseNumberTemp);

      // Get the last character and convert to lowercase
      var verseNumberTempLastChar = verseNumberTemp.slice(-1).toLowerCase();

      if (lastDigitPosition !== -1) {
        if (verseNumberTempLastChar === "a" || verseNumberTempLastChar === "b") {
          logMessage(getCallStackTrace() + " : Last character of the verseNumber is 'a' or 'b'");
          //getting the verse number including "a" or "b" at the end
          var verseNumber = verseNumberTemp.substring(0, lastDigitPosition + 2);
        } else {
          logMessage(getCallStackTrace() + " : Last character of the verseNumber is NOT 'a' or 'b'");
          var verseNumber = verseNumberTemp.substring(0, lastDigitPosition + 1);
        }
        logMessage(`${getCallStackTrace()}: The verseNumber : ${verseNumber}`);
      } else {
        logMessageError(`${getCallStackTrace()}: Error: This should never happen, there is no digit on the verse number: ${verseNumber}`);
        return;
      }

      if (i == 0) {
        bookNameSave = bookName;
        chapterNumberSave = chapterNumber;
        logMessage(`${getCallStackTrace()}: The 1st passage book name is ${bookNameSave}, and the book number is ${chapterNumberSave}, and this will be the book name and/or chapter number to be used if 2nd book name and/or chapter number and/or doesn't exist!!!`);
      } else if (i == 1 && bookName == "") {
        bookName = bookNameSave;
        logMessage(`${getCallStackTrace()}: The passage${i + 1} book name is empty, using the 1st book name \"${bookName}\"`);
      }

      logMessage(`${getCallStackTrace()}: The book name: ${bookName}`);
      logMessage(`${getCallStackTrace()}: The chapter number: ${chapterNumber}`);
      logMessage(`${getCallStackTrace()}: The verse number: ${verseNumber}`);

      // Handle passages spanning across multiple chapters (2 or more)
      if (verseNumber.match(":")) {
        logMessage(`${getCallStackTrace()}: This is a special format with passages spanning across chapters: ${str}`);
        var startChapter = parseInt(chapterNumber, 10); // Convert to integer if it's not already
        var endChapter = parseInt(extractDigitsBeforeIndex(verseNumber.indexOf(":"), verseNumber));
        var startChapterStartVerse = extractDigitsBeforeIndex(verseNumber.indexOf("-"), verseNumber);
        var startChapterEndVerse = end_verse(bookName + " " + chapterNumber);
        var endChapterStartVerse = 1;
        var endChapterEndVerse = verseNumber.substring((verseNumber.indexOf(":")) + 1);

        logMessage(`${getCallStackTrace()}: The startChapter: ${startChapter}`);
        logMessage(`${getCallStackTrace()}: The startChapterStartVerse: ${startChapterStartVerse}`);
        logMessage(`${getCallStackTrace()}: The startChapterEndVerse: ${startChapterEndVerse}`);
        logMessage(`${getCallStackTrace()}: The endChapter: ${endChapter}`);
        logMessage(`${getCallStackTrace()}: The endChapterStartVerse: ${endChapterStartVerse}`);
        logMessage(`${getCallStackTrace()}: The endChapterEndVerse: ${endChapterEndVerse}`);

        // Handle the first chapter (from startChapterStartVerse to end of the chapter)
        var returnPassage = bookName + " " + startChapter + ":" + startChapterStartVerse + "-" + startChapterEndVerse;
        logMessage(`${getCallStackTrace()}: The 1st passage return: ${returnPassage}`);
        array_return.push(returnPassage);

        // Handle middle chapters (if more than 2 chapters)
        for (var j = startChapter + 1; j < endChapter; j++) {
          returnPassage = bookName + " " + j;
          logMessage(`${getCallStackTrace()}: Middle chapter passage return: ${returnPassage}`);
          array_return.push(returnPassage);
        }

        // Handle the final chapter (from verse 1 to endChapterEndVerse)
        if (endChapterEndVerse == 1) {
          returnPassage = bookName + " " + endChapter + ":" + endChapterEndVerse;
        } else {
          returnPassage = bookName + " " + endChapter + ":" + endChapterStartVerse + "-" + endChapterEndVerse;
        }
        logMessage(`${getCallStackTrace()}: The final passage return: ${returnPassage}`);
        array_return.push(returnPassage);

      } else {
        // Handle passages within a single chapter
        var returnPassage = bookName + " " + chapterNumber + ":" + verseNumber;
        array_return.push(returnPassage);
      }

    } else {
      //mostly for the 2nd passage's weird format
      // No colon, so just the book name and chapter number (Romans 12)
      // or just verse info (12-18)
      logMessage(`${getCallStackTrace()}: Couldn't find colon on this passage \"${passage[i]}\"`);
      var endOfString = str.length;
      var bookName = str.substring(0, str.search(/\d/)).replace(/[\x00-\x7F]/g, "");
      if (bookName.match(/腓利門書|約翰二書|約翰三書|猶大書|俄巴底亞書/)) {
        chapterNumber = 1;
        var verseNumber = str.substring(str.search(/\d/)).replace(/[^\x00-\x7F]/g, '');
        logMessage(`${getCallStackTrace()}: The book name \"${bookName}\" is one of the single-chapter books, automatically setting chapter to 1.`);
        var returnPassage = bookName + " " + chapterNumber + ":" + verseNumber;
        array_return.push(returnPassage);
      } else if (bookName == "") {
        //no bookname or chapter number, just verse number (12-18)
        bookName = bookNameSave;
        chapterNumber = chapterNumberSave;
        verseNumber = str;
        var returnPassage = bookName + " " + chapterNumber + ":" + verseNumber;
        logMessage(`${getCallStackTrace()}: There is no book name and no chapter number, just verse number, modifying it to : ${returnPassage}`);
        array_return.push(returnPassage);
      } else {
        var chapterNumber = extractDigitsBeforeIndex(endOfString, str);
        logMessage(`${getCallStackTrace()}: The book name: ${bookName}`);
        logMessage(`${getCallStackTrace()}: The chapter number: ${chapterNumber}`);
        var returnPassage = bookName + " " + chapterNumber;
        array_return.push(returnPassage);
      }
    }

  }

  // Output the results
  logMessage(`${getCallStackTrace()}: This passage return from this function: ${JSON.stringify(array_return)}`);
  return array_return;
}
