function splitVerseIntoAB(one_verse_return) {
  const verseStr = one_verse_return.toString().toLowerCase();
  const match = one_verse_return.match(/^(.+?[.;:!?。])(.*)$/); //lazy match, 1st occurence of the punctuation mark
  //const match = one_verse_return.match(/^([^,.;:!?。，]+[,.!?;:，。]?)(.*)$/);

  if (match) {
    if (verseStr.includes("a")) {
      partialVerseA = match[1].trim();  // First part + punctuation
      logMessage(`${getCallStackTrace()}: partial verse return (part a) = ${partialVerseA} for original verse = ${one_verse_return}`);
      return partialVerseA;
    } else if (verseStr.includes("b")) {
      partialVerseB = match[2].trim();  // Second part
      logMessage(`${getCallStackTrace()}: partial verse return (part b) = ${partialVerseB} for original verse = ${one_verse_return}`);
      return partialVerseB;
    }
  } else {
    // Fallback if no punctuation match — use full string
    logMessage(`${getCallStackTrace()}: NO partial verse found, return the original verse = ${one_verse_return}`);
    return one_verse_return;
  }

}
