function getLastVerseOfChapter(book, chapter) {
  try {
    // Remove any non-Chinese characters from book name
    //const chineseBook = book.replace(/[^\u4e00-\u9fff]/g, '');
    var chineseBook = normalizeChineseBook(book);

    if (!ChineseBibleEachChapterLength[chineseBook]) {
      logMessageError(`${getCallStackTrace()}: ❌ Book not found: ${chineseBook}`);
      return "end";
    }

    const chapters = ChineseBibleEachChapterLength[chineseBook];

    if (chapter < 1 || chapter > chapters.length) {
      logMessageError(`${getCallStackTrace()}: ❌ Chapter ${chapter} out of range for ${chineseBook}`);
      return "end";
    }

    const lastVerse = chapters[chapter - 1]; // arrays are 0-indexed
    logMessage(`${getCallStackTrace()}: ✅ The last verse of ${chineseBook} ${chapter} is ${lastVerse}`);
    return lastVerse;
  } catch (error) {
    logMessageError(`${getCallStackTrace()}: ❌ Failed to get last verse of ${book} ${chapter}: ${error.message}`);
    return "end";
  }
}
