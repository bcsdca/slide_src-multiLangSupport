function normalizeBookName(book, language = "chinese") {

  //think of the input parameter "language" as the type of service

  const lang = (language || "chinese").toLowerCase();
  const input = (book || "").trim();
  
  const hasChinese = /[\u4e00-\u9fff]/.test(input);
  const hasEnglish = /[a-zA-Z]/.test(input);

  // =========================
  // Helpers
  // =========================
  const extractChinese = (str) =>
    str.replace(/[^\u4e00-\u9fff]/g, '').trim();

  const extractEnglish = (str) =>
    str
      .replace(/[\u4e00-\u9fff]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/^(\d)([a-z])/i, "$1 $2") // "1samuel" → "1 samuel"
      .trim();

  // =========================
  // Chinese / Bilingual Service
  // =========================
  if (lang !== "english") {

    // Case 1: English only → map to Chinese
    if (!hasChinese && hasEnglish) {
      const normalized = extractEnglish(input);
      const mapped = bibleBookMap[normalized];

      logMessage(
        `${getCallStackTrace()}: English input "${input}" → normalized "${normalized}" → Chinese "${mapped || input}"`
      );

      return mapped || input;
    }

    // Case 2: Chinese or Mixed → extract Chinese
    const chineseBook = extractChinese(input);

    logMessage(
      `${getCallStackTrace()}: Chinese/mixed input "${input}" → Chinese "${chineseBook}"`
    );

    return chineseBook || input;
  }

  // =========================
  // English Service
  // =========================

  // Case 3: Mixed → extract English
  if (hasChinese && hasEnglish) {
    const englishBook = extractEnglish(input);

    logMessage(
      `${getCallStackTrace()}: Mixed input "${input}" → English "${englishBook}"`
    );

    return englishBook || input;
  }

  // Case 4: English only → normalize
  if (!hasChinese && hasEnglish) {
    const englishBook = extractEnglish(input);

    logMessage(
      `${getCallStackTrace()}: English input "${input}" → normalized "${englishBook}"`
    );

    return englishBook;
  }

  // Case 5: Chinese only → map to English
  if (hasChinese && !hasEnglish) {
    const chineseBook = extractChinese(input);
    const englishBook = chineseToEnglishMap[chineseBook];

    if (!englishBook) {
      logMessageError(
        `${getCallStackTrace()}: No mapping found for Chinese book "${chineseBook}"`
      );
    }

    logMessage(
      `${getCallStackTrace()}: Chinese input "${input}" → English "${englishBook || chineseBook}"`
    );

    return englishBook || chineseBook;
  }

  // =========================
  // Fallback
  // =========================
  logMessageError(
    `${getCallStackTrace()}: Unable to normalize book: "${input}" (language=${lang})`
  );

  return input;
}