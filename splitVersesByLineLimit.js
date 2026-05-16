// =============================================
// CONFIGURATION
// =============================================

// Chinese layout limits
//const maxChineseCharsPerLine  = 18;
//const maxChineseLinesPerSlide = 7;

// English layout limits
//const maxEnglishCharsPerLine  = 30;
//const maxEnglishLinesPerSlide = 10;


// =============================================
// LANGUAGE DETECTION (numbers ignored)
// =============================================
function isEnglishText(text) {
  // English only if A–Z is present
  return /[A-Za-z]/.test(text);
}


// =============================================
// LINE COUNTING (numbers count as 1 char)
// =============================================
function estimateLines(text, charsPerLine) {
  let count = 0;

  for (const ch of text) {
    if (/[0-9]/.test(ch)) {
      count += 1;                    // numbers treated as 1 char
    } else {
      count += 1;                    // Chinese or English both 1 char for estimation
    }
  }

  return Math.ceil(count / charsPerLine);
}


// =============================================
// SPLITTING — CHINESE (character-based)
// =============================================
function splitChinesePreserveCharacters(text, maxCharsPerSlide) {
  const chars = Array.from(text);
  const chunks = [];
  let current = "";

  for (const ch of chars) {
    if (current.length + ch.length > maxCharsPerSlide) {
      chunks.push(current);
      current = "";
    }
    current += ch;
  }
  if (current.length > 0) chunks.push(current);

  return chunks;
}


// =============================================
// SPLITTING — ENGLISH (word-based)
// =============================================
function splitEnglishPreserveWords(text, maxCharsPerSlide) {
  // Keeps spaces, breaks on whitespace
  const words = text.split(/(\s+)/);

  const chunks = [];
  let current = "";

  for (const w of words) {
    if (current.length + w.length > maxCharsPerSlide) {
      if (current.trim().length > 0) chunks.push(current.trim());
      current = "";
    }
    current += w;
  }

  if (current.trim().length > 0) chunks.push(current.trim());

  return chunks;
}


// =============================================
// MAIN FUNCTION — SPLIT VERSES INTO SLIDES
// =============================================
function splitVersesByLineLimit(sheet, startingRow, passage, verseBlock) {

  const now = new Date();
  const formattedDate = Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );

  const verses = verseBlock
    .split('\n')
    .map(v => v.trim())
    .filter(Boolean);

  const rows = [];
  let currentSlide = [];
  let currentLineCount = 0;

  for (const verse of verses) {

    // Determine rule set (numbers do NOT influence)
    const englishMode = isEnglishText(verse);

    const charsPerLine = englishMode ? maxEnglishCharsPerLine : maxChineseCharsPerLine;
    const linesPerSlide = englishMode ? maxEnglishLinesPerSlide : maxChineseLinesPerSlide;
    const maxCharsPerSlide = charsPerLine * linesPerSlide;

    // Estimate lines accurately
    const estimatedLines = estimateLines(verse, charsPerLine);
    logMessage(`${getCallStackTrace()}: estimatedLines = ${estimatedLines}, for verse = ${verse}`);

    // ---------------------------------------------------------
    // CASE 1 — Verse exceeds slide limit → must split
    // ---------------------------------------------------------
    if (estimatedLines > linesPerSlide) {

      // flush current slide
      if (currentSlide.length > 0) {
        rows.push([passage, currentSlide.join("\n"), formattedDate]);
        currentSlide = [];
        currentLineCount = 0;
      }

      // split the long verse
      const chunks = englishMode
        ? splitEnglishPreserveWords(verse, maxCharsPerSlide)
        : splitChinesePreserveCharacters(verse, maxCharsPerSlide);

      for (const chunk of chunks) {
        rows.push([passage, chunk, formattedDate]);
      }

      continue;
    }

    // ---------------------------------------------------------
    // CASE 2 — Normal verse but adding it exceeds slide limit
    // ---------------------------------------------------------
    if (currentLineCount + estimatedLines > linesPerSlide) {
      rows.push([passage, currentSlide.join("\n"), formattedDate]);
      currentSlide = [];
      currentLineCount = 0;
    }

    // Add verse normally
    currentSlide.push(verse);
    currentLineCount += estimatedLines;
  }

  // last slide
  if (currentSlide.length > 0) {
    rows.push([passage, currentSlide.join("\n"), formattedDate]);
  }


  // =============================================
  // WRITE TO SHEET
  // =============================================
  try {
    sheet.insertRows(startingRow, rows.length);

    sheet.getRange(startingRow, 1, rows.length, 3)
      .setBackground("white")
      .setFontColor("black")
      .setValues(rows);

    return rows.length;

  } catch (error) {
    logMessageError(`${getCallStackTrace()}: Failed to insert rows: ${error.message}`);
  }
}
