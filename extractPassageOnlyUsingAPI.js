/**
 * Extract and insert Bible passages into a sheet using any model AIToolChosen.
 * @param {string} passageInput - User-provided Bible passage string.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet for inserting text.
 * @param {number} startingRow - Starting row for insertion.
 * @param {string} AIToolChosen - "gemini", "deepseek", or "chatgpt".
 * @returns {number} Total number of rows used.
 */
/*
function extractPassageOnlyUsingAPI(passageInput, sheet, startingRow, languageChosen, AIToolChosen) {
  logMessage(`${getCallStackTrace()}: Using AI tool \"${AIToolChosen}\" to process passage input of \"${passageInput}\"`);
  passageInput = passageInput.replace(/[*]+/g, "").trim();
  const passages = passageInput
    .split(/[;；]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const normalizedPassages = normalizePassages(passages);
  let totalRowsUsed = 0;
  let chineseArray = [];
  let englishArray = [];

  for (var passage of normalizedPassages) {
    logMessage(`${getCallStackTrace()}: Processing passage = ${passage}`);

    const prompt = buildBiblePassagePrompt(AIToolChosen, passage);
    const reply = runAllAIPassageOnly(AIToolChosen, prompt);

    if (!reply) {
      logMessageError(`${getCallStackTrace()}: Empty response from ${AIToolChosen} for ${passage}`);
      continue;
    }

    logMessage(`${getCallStackTrace()}: Raw string \"reply\" from ${AIToolChosen} for ${passage} = ${reply}`);

    let parsed;
    try {
      //convert string reply to object parsed
      parsed = JSON.parse(reply);
      logMessage(`${getCallStackTrace()}: \"parsed\" after \"reply\" was converted to object = ${JSON.stringify(parsed, null, 2)}`);
    } catch (err) {
      logMessageError(`${getCallStackTrace()}: Failed to parse JSON for ${passage}: ${err}`);
      continue;
    }

    // ✅ INSERT THE GUARD RIGHT HERE
    // ---------- HARD FAIL: ChatGPT refusal detection ----------
    if (
      AIToolChosen.toLowerCase() === "chatgpt" &&
      Array.isArray(parsed.chinese) &&
      parsed.chinese.length > 0 &&
      parsed.chinese.every(v => typeof v === "string" && /^\d+$/.test(v.trim()))
    ) {
      const errorMsg =
        `${getCallStackTrace()}: ChatGPT refused scripture output ` +
        `(verse numbers only) for ${passage}`;

      logMessageError(errorMsg);
      throw new Error(errorMsg); // 🔥 STOP everything
    }

    if (!parsed.chinese?.length || !parsed.english?.length) {
      logMessageError(`${getCallStackTrace()}: Missing chinese or english array for ${passage}`);
      continue;
    }

    // Remove all instances of "（細拉）" before pushing to chineseArray
    const cleanedChinese = parsed.chinese.map(line =>
      line.replace(/（\s*細拉\s*）/g, '').trim()
    );

    chineseArray.push(...cleanedChinese);
    englishArray.push(...parsed.english);

    const combineArray = mergeBilingualSlides(chineseArray, englishArray, languageChosen);
    logMessage(`${getCallStackTrace()}: combine array = ${JSON.stringify(combineArray, null, 2)} for passage ${passage}`);

    if (languageChosen === "english") {
      // Remove everything before "(" and remove the closing ")"
      passage = passage.replace(/^.*\(/, "").replace(/\)/, "");
    } else if (languageChosen === "chinese") {
      // Remove everything inside parenthesis, which is the english name)"
      passage = passage.replace(/\(.*\)/, "");
    }

    const rowsUsed = insertCombineArrayToSheet(passage, combineArray, startingRow, sheet);
    logMessage(`${getCallStackTrace()}: Inserted passage "${passage}" to sheet with ${rowsUsed} rows.`);

    startingRow += rowsUsed;
    totalRowsUsed += rowsUsed;

    chineseArray = [];
    englishArray = [];
  }
  return totalRowsUsed;
}

function normalizePassages(passages) {
  const results = [];
  let lastBookPrefix = null;

  for (const rawPassage of passages) {
    const hasBook = /[^\x00-\x7F]/.test(rawPassage); // detect Chinese chars in book
    let passage = rawPassage;

    if (hasBook) {
      lastBookPrefix = rawPassage.replace(/\d.*$/, "").trim();
    } else if (lastBookPrefix) {
      passage = `${lastBookPrefix} ${rawPassage}`;
    }

    const crossMatch = passage.match(/(.+?)\s+(\d+):(\d+)-(\d+):(\d+)/);
    if (crossMatch) {
      const book = crossMatch[1].trim();
      const startChapter = parseInt(crossMatch[2]);
      const startVerse = parseInt(crossMatch[3]);
      const endChapter = parseInt(crossMatch[4]);
      const endVerse = parseInt(crossMatch[5]);

      const endVerseOfStart = getLastVerseOfChapter(book, startChapter);
      results.push(formatVerseRange(book, startChapter, startVerse, endVerseOfStart));

      // Middle chapters if any
      if (endChapter > startChapter + 1) {
        for (let c = startChapter + 1; c < endChapter; c++) {
          const endVerseOfChapter = getLastVerseOfChapter(book, c);
          results.push(formatVerseRange(book, c, 1, endVerseOfChapter));
        }
      }

      // Last chapter
      results.push(formatVerseRange(book, endChapter, 1, endVerse));

    } else {
      // Single verse or simple passage
      results.push(passage);
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

  //const rows = [];
  let totalRowsUsed = 0;

  for (const item of combineArray) {
    // Convert the slide array into a readable text block
    const slideText = Array.isArray(item) ? item.join("\n") : String(item);

    logMessage(`${getCallStackTrace()}: slideText = "${slideText}" for item = "${item}"`);

    const rowsUsed = splitVersesByLineLimit(sheet, startingRow, passage, slideText);
    logMessage(`${getCallStackTrace()}: Inserted slideText = "${slideText}" for passage "${passage}" with ${rowsUsed} rows.`);

    startingRow += rowsUsed;
    totalRowsUsed += rowsUsed;

    // Push one row per slide
    //rows.push([passage, slideText, new Date()]);
  }

  return totalRowsUsed;
}
*/