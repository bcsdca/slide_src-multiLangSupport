/**
 * @param {string} passageInput - User-provided Bible passage string.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet for inserting text.
 * @param {number} startingRow - Starting row for insertion.
 * @returns {number} Total number of rows used.
 */

function extractBilingualPassage(
  passageInput,
  sheet,
  startingRow,
  languageChosen,
  provider,
  usingJSONBible,
  fontProfile
) {

  try {

    // increment startingRow, because the startingRow pointing to the TITLE row
    // we needed to point the row after now because we use insert row,
    // which will insert before this current row

    startingRow++;

    logMessage(
      `${getCallStackTrace()}: Processing passage input of "${passageInput}" for language "${languageChosen}", font profile of "${fontProfile}"`
    );

    logMessage(
      `${getCallStackTrace()}: Inserting to row ${startingRow} of the google sheet`
    );
      
    //split due to ; or , as long as there are 2 book names
    const passages = splitPassage(passageInput)

    const normalizedPassages =
      normalizePassages(passages);

    let totalRowsUsed = 0;

    let chineseArray = [];
    let englishArray = [];

    let combineArray = [];

    // =====================================================
    // PROCESS REVERSE ORDER
    // =====================================================

    for (const passage of [...normalizedPassages].reverse()) {

      logMessage(
        `${getCallStackTrace()}: Processing passage = ${passage}, for language "${languageChosen}"`
      );

      try {

        // ================================================
        // FETCH PASSAGES
        // ================================================

        if (languageChosen === "english") {

          englishArray =
            passageCaptureBilingual(
              passage,
              languageChosen,
              provider,
              usingJSONBible
            );

        } else if (languageChosen === "chinese") {

          chineseArray =
            passageCaptureBilingual(
              passage,
              languageChosen,
              provider,
              usingJSONBible
            );

        } else if (
          languageChosen === "bilingualChineseFirst" ||
          languageChosen === "bilingualEnglishFirst"
        ) {

          chineseArray =
            passageCaptureBilingual(
              passage,
              "chinese",
              provider,
              usingJSONBible
            );

          englishArray =
            passageCaptureBilingual(
              passage,
              "english",
              provider,
              usingJSONBible
            );
        }

        // ================================================
        // MERGE SLIDES
        // ================================================

        combineArray =
          mergeBilingualSlides(
            chineseArray,
            englishArray,
            languageChosen,
            fontProfile
          );

        // ================================================
        // CONVERT TITLE TO ENGLISH
        // ================================================

        let displayPassage = passage;

        if (
          languageChosen === "english" ||
          languageChosen === "bilingualEnglishFirst"
        ) {

          displayPassage =
            convertPassageToEnglish(passage);
        }

        logMessage(
          `${getCallStackTrace()}: combine array = ${JSON.stringify(combineArray, null, 2)} for passage ${displayPassage}`
        );

        // ================================================
        // INSERT TO SHEET
        // ================================================

        insertCombineArrayToSheet(
          displayPassage,
          combineArray,
          startingRow,
          sheet
        );

        logMessage(
          `${getCallStackTrace()}: Inserted passage "${displayPassage}" to sheet with ${combineArray.length} rows.`
        );

        totalRowsUsed += combineArray.length;

      } catch (err) {

        logMessageError(
          `${getCallStackTrace()}: Failed processing passage "${passage}" → ${err}`
        );
      }

      // reset arrays

      chineseArray = [];
      englishArray = [];
    }

    return totalRowsUsed;

  } catch (err) {

    logMessageError(
      `${getCallStackTrace()}: Exception → ${err}`
    );

    return 0;
  }
}

function convertPassageToEnglish(passage) {

  // If passage already contains English letters,
  // assume it already has an English book name
  // requiring at least 2 consecutive English letters: to avoid "歷代志下 14:10b-15a"
  if (/[A-Za-z]{2,}/.test(passage)) {

    logMessage(
      `${getCallStackTrace()}: Passage already contains English name = ${passage}`
    );

    return passage;
  }

  for (const [chi, eng] of Object.entries(chineseToEnglishMap)) {

    if (passage.startsWith(chi)) {

      // Capitalize first English letter
      const capitalizedEng =
        eng.replace(/[a-z]/, char => char.toUpperCase());

      const updatedPassage =
        capitalizedEng + passage.slice(chi.length);

      logMessage(
        `${getCallStackTrace()}: Updated to english passage name = ${updatedPassage}`
      );

      return updatedPassage;
    }
  }

  return passage;
}

function normalizePassages(passages) {
  const results = [];
  let lastBookPrefix = null;

  for (const rawPassage of passages) {
    const hasBook = /^[\u4e00-\u9fff]+/.test(rawPassage); // detect Chinese chars in book at the start of the string
    let passage = rawPassage;

    if (hasBook) {
      lastBookPrefix = rawPassage.replace(/\d.*$/, "").trim();
    } else if (lastBookPrefix) {
      passage = `${lastBookPrefix} ${rawPassage}`;
    }

    //創世記 7:13a-8:2b
    const crossMatch = passage.match(/^(.+?)\s+(\d+):(\d+[ab]?)\s*-\s*(\d+):(\d+[ab]?)$/);
    if (crossMatch) {
      const book = crossMatch[1].trim();
      const startChapter = parseInt(crossMatch[2]);
      const startVerse = crossMatch[3];
      const endChapter = parseInt(crossMatch[4]);
      const endVerse = crossMatch[5];

      logMessage(`${getCallStackTrace()}: Crossing chapter passage read condtion is detected, from chapter ${startChapter} verse ${startVerse}, to chapter ${endChapter} verse ${endVerse}, of book ${book}`);

      const endVerseOfStart = getLastVerseOfChapter(book, startChapter);
      results.push(formatVerseRange(book, startChapter, startVerse, endVerseOfStart));

      // Middle chapters if any
      if (endChapter > startChapter + 1) {
        for (let c = startChapter + 1; c < endChapter; c++) {
          const endVerseOfChapter = getLastVerseOfChapter(book, c);
          results.push(formatVerseRange(book, c, 1, endVerseOfChapter));
          logMessage(`${getCallStackTrace()}: Extra middle chapter condtion is detected, from chapter ${startChapter} to chapter ${endChapter} of book ${book}`);
        }
      }

      // Last chapter
      results.push(formatVerseRange(book, endChapter, 1, endVerse));

    } else {
      // Single verse or simple passage
      // =========================================
      // Clean passage logging
      // =========================================

      const cleanedPassage =
        cleanPassage(passage);

      logMessage(`${getCallStackTrace()}: Cleaned Format for "${passage}" → "${cleanedPassage}"`);
      results.push(cleanedPassage);
      logMessage(`${getCallStackTrace()}: Simple passage read condtion, and the passage to read is ${cleanedPassage}`);
    }
  }

  logMessage(`${getCallStackTrace()}: Normalized passages = ${JSON.stringify(results, null, 2)}`);
  return results;
}

// Helper to format a verse range, collapsing start=end
function formatVerseRange(book, chapter, startVerse, endVerse) {
  if (startVerse === endVerse) {
    return `${book} ${chapter}:${startVerse}`;
  } else {
    return `${book} ${chapter}:${startVerse}-${endVerse}`;
  }
}

function insertCombineArrayToSheet(passage, combineArray, startingRow, sheet) {
  // combineArray = output of mergeBilingualSlides(chineseArray, englishArray)
  // sheet = active sheet
  // startingRow = first row to insert
  // passage = current passage reference (e.g., "詩篇 100:1-5")

  for (const item of combineArray) {
    // Convert the slide array into a readable text block
    const slideText = Array.isArray(item) ? item.join("\n") : String(item);

    logMessage(`${getCallStackTrace()}: slideText = "${slideText}" for item = "${item}"`);

    insertVerseToSheet(sheet, startingRow, passage, slideText);
    startingRow++;
    logMessage(`${getCallStackTrace()}: Inserted slideText = "${slideText}" for passage "${passage}" with 1 row.`);
  }
}

function insertVerseToSheet(sheet, startingRow, passage, verseBlock) {

  const now = new Date();
  const formattedDate = Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );

  //row.push([passage, verseBlock, formattedDate]);
  row = [[passage, verseBlock, formattedDate]];

  // =============================================
  // WRITE TO SHEET
  // =============================================
  try {
    sheet.insertRows(startingRow, 1);

    sheet.getRange(startingRow, 1, 1, 3)
      .setBackground("white")
      .setFontColor("black")
      .setValues(row)

  } catch (error) {
    logMessageError(`${getCallStackTrace()}: Failed to insert rows: ${error.message}`);
  }
}

/**
 * Clean redundant Bible passage references.
 *
 * Examples:
 * "John 3:16-16"
 *   → "John 3:16"
 *
 * "John 3:16-3:16"
 *   → "John 3:16"
 *
 * "John 3:16a-16a"
 *   → "John 3:16a"
 *
 * "John 3:16b-16b"
 *   → "John 3:16b"
 */
function cleanPassage(passage) {

  return passage.replace(
    /(\d+):(\d+)([ab]?)-(?:([\d]+):)?(\d+)([ab]?)/,

    (
      match,
      ch1,
      v1,
      part1,
      ch2,
      v2,
      part2
    ) => {

      // same chapter + same verse + same partial verse
      if (
        (ch2 ?? ch1) === ch1 &&
        v2 === v1 &&
        part2 === part1
      ) {

        return `${ch1}:${v1}${part1}`;
      }

      return match;
    }
  );
}
