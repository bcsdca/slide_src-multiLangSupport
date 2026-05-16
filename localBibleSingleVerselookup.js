function localBibleSingleVerselookup(book, chapter, verse, language = "chinese", bible) {
  /**
   * Reads single verse from cuvBible.json
   * @param {string} book
   * @param {number|string} chapter
   * @param {number|string} verse, it will remove any alphebet after the verse number before lookup
   * @returns {string|undefined}
   */

  try {

    if (!bible) {
      bible = loadLocalBibleJson(language);
    }

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
    return verseStr + " " + "*** 找不到經文 (VERSE NOT FOUND) ***";

  } catch (error) {

    logMessage(getCallStackTrace() + `: Error reading bible.json: ${error.message}`);
    return undefined;
  }
}

function loadLocalBibleJson(language = "chinese") {
  try {
    const lang = (language || "chinese").toLowerCase();

    let fileId;

    // =========================
    // Select file ID by language
    // =========================
    if (lang === "chinese") {
      fileId = CUV_BIBLE_ID;
    } else if (lang === "english") {
      fileId = NIV_BIBLE_ID; // make sure this constant exists
    } else {
      logMessageError(`${getCallStackTrace()}: Unsupported language: ${lang}`);
      return {};
    }

    // =========================
    // Load file
    // =========================
    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();

    // 🔍 DEBUG: check content length
    //logMessage(`${getCallStackTrace()}: Loaded content length=${content.length}`);

    const parsed = JSON.parse(content);

    logMessage(`${getCallStackTrace()}: Successfully loaded Bible JSON (${lang})`);

    return parsed;

  } catch (error) {
    logMessageError(
      `${getCallStackTrace()}: Error loading Bible JSON (${language}): ${error}`
    );
    return {};
  }
}



