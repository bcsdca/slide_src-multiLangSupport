function normalizeChineseBook(book) {

  const hasChinese = /[\u4e00-\u9fff]/.test(book);
  const hasEnglish = /[a-zA-Z]/.test(book);

  // English only → translate
  if (!hasChinese && hasEnglish) {

    const normalized = book
      .toLowerCase()
      .replace(/^(\d)([a-z])/i, "$1 $2") // convert "1samuel" → "1 samuel"
      .trim();

    logMessage(`${getCallStackTrace()}: ✅ The book name is in English language(normalized) ${normalized}, and the look up Chinese book name is ${bibleBookMap[normalized]}`);
    return bibleBookMap[normalized] || book;
  }
 
  // Mixed → keep ONLY Chinese characters
  if (hasChinese && hasEnglish) {
    logMessage(`${getCallStackTrace()}: ✅ The book name has mixed language ${book}`);

    return book
      .replace(/[^\u4e00-\u9fff]/g, '') // remove everything NOT Chinese
      .trim();
  }

  // Already Chinese
  logMessage(`${getCallStackTrace()}: ✅ The book name is in Chinese language ${book}`);
  return book;
}
