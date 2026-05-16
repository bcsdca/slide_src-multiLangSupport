function splitVersesByLineLimitBalance(sheet, startingRow, passage, verseBlock) {

  const verses = verseBlock.split('\n').map(v => v.trim()).filter(Boolean);

  const verseLineInfo = verses.map(verse => ({
    text: verse,
    lines: Math.ceil(verse.length / maxCharsPerLine)
  }));

  const totalLines = verseLineInfo.reduce((sum, v) => sum + v.lines, 0);
  const numSlides = Math.ceil(totalLines / maxLinesPerSlide);
  const targetLinesPerSlide = Math.ceil(totalLines / numSlides);

  logMessage(`${getCallStackTrace()}: Total Estimated Max lines Required = ${totalLines}, Total Estimated Max Slides Required = ${numSlides}, Target lines/slide = ${targetLinesPerSlide}`);

  let currentSlide = [];
  let currentLineCount = 0;

  const rows = [];

  for (const verse of verseLineInfo) {
    if (
      currentLineCount + verse.lines > targetLinesPerSlide &&
      currentSlide.length > 0
    ) {
      logMessage(`${getCallStackTrace()}: The current line count = ${currentLineCount}, and if we included this current verse = ${verse.text}, which will require additional ${verse.lines} lines, and that exceed the max target lines of the slide = ${targetLinesPerSlide}, so we move this current verse to the next row !!!`);
      rows.push([passage, currentSlide.join('\n'), new Date()]);
      currentSlide = [];
      currentLineCount = 0;
    }

    currentSlide.push(verse.text);
    currentLineCount += verse.lines;
  }

  if (currentSlide.length > 0) {
    logMessage(`${getCallStackTrace()}: Writing out to the last row with verse = ${currentSlide.join('\n')}, and this last row is kind of unexpected and/or might be exceeding the estimated max slides/rows required, which is ${numSlides}!!!!`);
    rows.push([passage, currentSlide.join('\n'), new Date()]);
  }

  try {
    // Insert required rows at startingRow
    sheet.insertRows(startingRow, rows.length);

    // Write the values
    sheet.getRange(startingRow, 1, rows.length, 3).setBackground('white').setFontColor("black").setValues(rows);

    logMessage(`${getCallStackTrace()}: The starting row to insert passage = ${startingRow}, with the row content = ${JSON.stringify(rows, null, 2)}, and total Rows used up by this function = ${rows.length}`);
    return rows.length;
  } catch (error) {
    logMessageError(`${getCallStackTrace()}: Error to insert passage at starting row = ${startingRow}, with the row content = ${JSON.stringify(rows, null, 2)}, and # of rows to insert = ${rows.length}: - ${error.message}`);

  }
}

