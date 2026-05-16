/**
 * Extract and insert Bible passages into a sheet using any model provider.
 * @param {string} passageInput - User-provided Bible passage string.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet for inserting text.
 * @param {number} startingRow - Starting row for insertion.
 * @param {string} provider - "gemini", "deepseek", or "chatgpt".
 * @returns {number} Total number of rows used.
 */

/*
function extractPassageUsingCuvBible(passageInput, sheet, startingRow, provider = "gemini") {
  passageInput = passageInput.replace(/[*]+/g, "").trim(); // remove asterisks
  const passages = passageInput
    .split(/[;；]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  let lastBookPrefix = null;

  // --- Normalize multi-chapter passages ---
  const normalizePassages = passages => {
    const results = [];
    for (const rawPassage of passages) {
      const hasBook = /[^\x00-\x7F]/.test(rawPassage);
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
        results.push(`${book} ${startChapter}:${startVerse}-${endVerseOfStart}`);

        if (endChapter > startChapter + 1) {
          for (let c = startChapter + 1; c < endChapter; c++) {
            const endVerseOfChapter = getLastVerseOfChapter(book, c);
            results.push(`${book} ${c}:1-${endVerseOfChapter}`);
          }
        }

        results.push(`${book} ${endChapter}:1-${endVerse}`);
      } else {
        results.push(passage);
      }
    }

    logMessage(`${getCallStackTrace()}: Normalized passages = ${JSON.stringify(results, null, 2)}`);
    return results;
  };

  const normalizedPassages = normalizePassages(passages);
  let totalRowsUsed = 0;

  // --- Fetch text for each passage ---
  for (const passage of normalizedPassages) {
    logMessage(`${getCallStackTrace()}: Processing passage using cuvBible look up = ${passage}`);

    const reply = passageCapture(passage);

    if (!reply) {
      logMessageError(`${getCallStackTrace()}: Empty response for ${passage}`);
      continue;
    }

    logMessage(`${getCallStackTrace()}: Response for ${passage} = ${reply}`);

    const cleaned = reply.join("\n");

    const cleanedPassage = cleanPassage(passage);
    logMessage(`${getCallStackTrace()}: Cleaned Format for "${passage}" → "${cleanedPassage}"`);

    if (!cleaned.trim()) {
      logMessageError(`${getCallStackTrace()}: ⚠️ No verses found for ${passage}, skipping.`);
      continue;
    }

    const rowsUsed = splitVersesByLineLimit(sheet, startingRow, cleanedPassage, cleaned);
    logMessage(`${getCallStackTrace()}: Inserted passage "${passage}" with ${rowsUsed} rows.`);

    startingRow += rowsUsed;
    totalRowsUsed += rowsUsed;
  }

  return totalRowsUsed;
}
*/

/**
 * Clean redundant Bible passage references.
 * e.g. "John 3:16-16" → "John 3:16", "John 3:16-3:16" → "John 3:16"
 */
/*
function cleanPassage(passage) {
  return passage.replace(
    /(\d+):(\d+)-(?:([\d]+):)?(\d+)/,
    (match, ch1, v1, ch2, v2) => {
      // If same chapter and same verse (e.g., 3:16-16 or 3:16-3:16)
      if ((ch2 ?? ch1) === ch1 && v2 === v1) {
        return `${ch1}:${v1}`;
      }
      // Otherwise, keep the original
      return match;
    }
  );
}
*/