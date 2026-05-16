function cuvBibleSingleVerselookup(book, chapter, verse) {
  /**
   * Reads single verse from cuvBible.json
   * @param {string} book
   * @param {number|string} chapter
   * @param {number|string} verse, it will remove any alphebet after the verse number before lookup
   * @returns {string|undefined}
   */

  try {

    const bible = loadCuvBibleJson();

    const chapterStr = chapter.toString();

    // ✅ Remove trailing letters (a, b, A, B, etc.) before lookup
    const verseStrLookup = verse
      .toString()
      .replace(/[a-zA-Z]+$/, '');

    const verseStr = verse //this is the verse # return, will include partial verse, like a or b, if it existed
      .toString();
      
    if (
      bible[book] &&
      bible[book][chapterStr] &&
      bible[book][chapterStr][verseStrLookup]
    ) {
      logMessage(getCallStackTrace() + `: Verse found: ${book} ${chapter}:${verseStrLookup}`);
      return verseStr + " " + bible[book][chapterStr][verseStrLookup];
    }

    logMessage(getCallStackTrace() + `: Verse not found: ${book} ${chapter}:${verseStrLookup}`);
    return undefined;

  } catch (error) {

    logMessage(getCallStackTrace() + `: Error reading cuvBible.json: ${error.message}`);
    return undefined;
  }
}

function loadCuvBibleJson() {
  try {
    const file = DriveApp.getFileById(CUV_BIBLE_ID);
    const content = file.getBlob().getDataAsString();
    return JSON.parse(content);
  } catch (error) {
    Logger.log("Error loading Bible JSON: " + error);
    return {};
  }
}
