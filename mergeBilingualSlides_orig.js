/*function mergeBilingualSlides(chineseArray, englishArray, languageChosen) {
  let maxCharsPerLine, maxLinesPerSlide;

  // --- Determine layout mode ---
  // base on calibri 52 fonts
  if (languageChosen == "bilingual") {
    maxCharsPerLine = 18;
    maxLinesPerSlide = 3; // for Chinese (3 CN lines + 3 EN lines = 6 total)
    logMessage(`${getCallStackTrace()}: Generating bilingual passage slides`);
  } else if (languageChosen == "chinese") {
    maxCharsPerLine = 18;
    maxLinesPerSlide = 7; // all Chinese
    logMessage(`${getCallStackTrace()}: Generating Chinese passage slides`);
  } else {
    // English-only mode
    maxCharsPerLine = 40;
    maxLinesPerSlide = 7; // all English
    logMessage(`${getCallStackTrace()}: Generating English passage slides`);
  }

  const combined = [];
  let i = 0;

  // --- Bilingual Mode ---
  if (languageChosen == "bilingual") {
    while (i < chineseArray.length) {
      let linesCount = 0;
      const slideChinese = [];
      const slideEnglish = [];
      logMessage(`${getCallStackTrace()}: Starting up a new slide or row with verse = \"${chineseArray[i]}\"`);

      while (i < chineseArray.length && linesCount < maxLinesPerSlide) {
        const verse = chineseArray[i];
        const verseLines = Math.ceil(verse.length / maxCharsPerLine);
        logMessage(`${getCallStackTrace()}: Processing this current verse \"${verse}\", with ${verse.length} chars and took up ${verseLines} lines\"`);

        // if adding this verse exceeds limit, start a new slide or new row
        // if it is equal to limit, it will also start a new slide essentially through this condition 
        // "while (i < chineseArray.length && linesCount < maxLinesPerSlide)"
        
        if ((linesCount + verseLines > maxLinesPerSlide) && slideChinese.length > 0) {
          logMessage(`${getCallStackTrace()}: This is the row break condition, the current verse \"${verse}\" will go to a new slide or row, because there are already ${linesCount} lines in this row, and this current verse will take up additional ${verseLines} lines, and that will exceed the max ${maxLinesPerSlide} lines allowed on this slide`);
          break;
        }

        //building up the current row or slide
        slideChinese.push(verse);
        slideEnglish.push(englishArray[i]);
        linesCount += verseLines;
        logMessage(`${getCallStackTrace()}: The content of slideChinese after adding a new verse = ${JSON.stringify(slideChinese, null, 2)}, and used up ${linesCount} lines`);
        logMessage(`${getCallStackTrace()}: The content of slideEnglish after adding a new verse = ${JSON.stringify(slideEnglish, null, 2)}`);
        i++;
      }

      // Push one combined bilingual slide
      combined.push([...slideChinese, ...slideEnglish]);
      logMessage(`${getCallStackTrace()}: The content of combined array after adding a new slide or row = ${JSON.stringify(combined, null, 2)}`);
    }

    return combined;
  }

  // --- Chinese-Only or English-Only Mode ---
  const sourceArray = languageChosen == "chinese" ? chineseArray : englishArray;

  while (i < sourceArray.length) {
    let linesCount = 0;
    const slideVerses = [];
    logMessage(`${getCallStackTrace()}: Starting up a new slide or row with verse = \"${sourceArray[i]}\"`);
    
    while (i < sourceArray.length && linesCount < maxLinesPerSlide) {
      
      const verse = sourceArray[i];
      const verseLines = Math.ceil(verse.length / maxCharsPerLine);
      logMessage(`${getCallStackTrace()}: Processing this current verse \"${verse}\", with ${verse.length} chars and took up ${verseLines} lines\"`);

      if ((linesCount + verseLines) > maxLinesPerSlide && slideVerses.length > 0) {
        logMessage(`${getCallStackTrace()}: This is the row break condition, the current verse \"${verse}\" will go to a new row, because there are already ${linesCount} lines in this row, and this current verse will take up additional ${verseLines} lines, and that will exceed the max ${maxLinesPerSlide} lines allowed on this slide`);
        break;
      }

      slideVerses.push(verse);
      linesCount += verseLines;
      logMessage(`${getCallStackTrace()}: The content of slideVerses after adding a new verse = ${JSON.stringify(slideVerses, null, 2)}, and used up ${linesCount} lines`);
      i++;
    }

    // Each slide = array of verse lines
    combined.push(slideVerses);
    logMessage(`${getCallStackTrace()}: The content of combined array after adding a new slide or row = ${JSON.stringify(combined, null, 2)}`);
  }

  return combined;
}
*/