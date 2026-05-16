function passageCapture(
  p,
  languageChosen,
  provider,
  usingJSONBible
) {

  try {

    // =========================
    // 1. Validate input
    // =========================

    if (!p || typeof p !== "string") {

      logMessageError(
        `${getCallStackTrace()}: Invalid input: ${p}`
      );

      return [];
    }

    const input = p.trim();

    const language =
      (languageChosen || "chinese")
        .toLowerCase();

    // =========================
    // 2. Parse book + remainder
    // =========================

    const [rawBook, ...restParts] =
      input.split(" ");

    const remainder =
      restParts.join("").trim();

    const book =
      normalizeBookName(
        rawBook,
        language
      );

    if (!book) {

      logMessageError(
        `${getCallStackTrace()}: Cannot normalize book: ${rawBook}`
      );

      return [];
    }

    // =========================
    // 3. Parse chapter & verses
    // =========================

    const match =
      remainder.match(/(\d+):(.+)$/);

    if (!match) {

      logMessageError(
        `${getCallStackTrace()}: Invalid chapter/verse format: ${remainder}`
      );

      return [];
    }

    const chapter = match[1];

    const verseRaw = match[2];

    if (!chapter) {

      logMessageError(
        `${getCallStackTrace()}: Invalid chapter in input: ${input}`
      );

      return [];
    }

    logMessage(
      `${getCallStackTrace()}: Breaking down the passage input = ${input}, to book name = ${book}, chapter number = ${chapter}, and verse info = ${verseRaw}`
    );

    // =========================
    // 4. Main Logic
    // =========================

    let results = [];

    // =====================================================
    // USING LOCAL JSON BIBLE
    // =====================================================

    if (usingJSONBible) {

      logMessage(
        `${getCallStackTrace()}: Using JSON Bible flag = ${usingJSONBible}, so just processing passage = ${input}, using pre-compiled ${language} json bible`
      );

      results =
        fetchPassageFromJsonBible(
          input,
          language
        );

    // =====================================================
    // USING AI
    // =====================================================

    } else {

      logMessage(
        `${getCallStackTrace()}: Using JSON Bible flag = ${usingJSONBible}, so just processing passage = ${input}, using ${provider} AI tool, using language ${language}`
      );

      try {

        const prompt =
          buildBiblePassagePrompt(
            provider,
            input,
            language
          );

        const reply =
          runAIPassage(
            provider,
            prompt
          );

        // =========================================
        // EMPTY AI RESPONSE
        // =========================================

        if (
          !reply ||
          !reply.trim()
        ) {

          throw new Error(
            `Empty response from ${provider}`
          );
        }

        logMessage(
          `${getCallStackTrace()}: Raw json ouput from ${provider} for ${input} = ${reply}, in language ${language}`
        );

        try {

          // =====================================
          // Parse JSON
          // =====================================

          const parsed =
            JSON.parse(reply);

          const lang =
            (language || "")
              .toLowerCase();

          if (
            !["chinese", "english"]
              .includes(lang)
          ) {

            throw new Error(
              `Invalid language: ${language}`
            );
          }

          results = parsed[lang];

          if (
            !Array.isArray(results)
          ) {

            throw new Error(
              `Missing or invalid array for language: ${lang}`
            );
          }

          logMessage(
            `${getCallStackTrace()}: after conversion to array from json object = ${JSON.stringify(results, null, 2)}`
          );

        } catch (err) {

          // =====================================
          // FALLBACK TEXT PARSING
          // =====================================

          logMessageError(
            `${getCallStackTrace()}: JSON parse failed, falling back to text parsing`
          );

          results = reply
            .replace(
              /^[\s\S]*?(?=\d+(?:[abAB上下])?\s)/,
              ""
            )
            .split("\n")
            .filter(line =>
              /^\d+/.test(
                line.trim()
              )
            )
            .map(line =>
              line
                .replace(/\*/g, "")
                .replace(/（細拉）[。.]?/g, "")
                .replace(/^\s*(\d+)上/, "$1a")
                .replace(/^\s*(\d+)下/, "$1b")
                .trim()
            );
        }

        // =========================================
        // Clean passage logging
        // =========================================

        //const cleanedPassage =
        //  cleanPassage(input);

        //logMessage(
        //  `${getCallStackTrace()}: Cleaned Format for "${input}" → "${cleanedPassage}"`
        //);

        // =========================================
        // EMPTY RESULTS
        // =========================================

        if (
          !results ||
          results.length === 0
        ) {

          throw new Error(
            `No verses returned from AI`
          );
        }

      } catch (err) {

        // =========================================
        // AI FAILED
        // FALLBACK TO LOCAL JSON BIBLE
        // =========================================

        logMessageError(`
${getCallStackTrace()}: AI passage retrieval failed.

Error:
${err}

Falling back to local JSON Bible...
`);

        results =
          fetchPassageFromJsonBible(
            input,
            language
          );

        logMessage(`
${getCallStackTrace()}: JSON Bible fallback successful.

Returned verses:
${JSON.stringify(results, null, 2)}
`);
      }
    }

    // =========================
    // 5. Return result
    // =========================

    logMessage(
      `${getCallStackTrace()}: Returning verse array = ${JSON.stringify(results, null, 2)}, (language=${language})`
    );

    return results;

  } catch (err) {

    logMessageError(
      `${getCallStackTrace()}: Exception → ${err}`
    );

    return [];
  }
}

// =========================================================
// LOCAL JSON BIBLE FETCHER
// =========================================================

function fetchPassageFromJsonBible(
  input,
  language
) {

  // =========================
  // Parse input again
  // =========================

  const [rawBook, ...restParts] =
    input.split(" ");

  const remainder =
    restParts.join("").trim();

  const book =
    normalizeBookName(
      rawBook,
      language
    );

  const match =
    remainder.match(/(\d+):(.+)$/);

  const chapter =
    match[1];

  const verseRaw =
    match[2];

  const bible =
    loadLocalBibleJson(language);

  let versesArray = [];

  if (verseRaw) {

    versesArray =
      breakDownVerses(verseRaw);

  } else {

    logMessage(
      `${getCallStackTrace()}: No verse info found, using full chapter`
    );

    const lastVerse =
      getLastVerseOfChapter(
        book,
        chapter
      );

    versesArray =
      breakDownVerses(
        `1-${lastVerse}`
      );
  }

  logMessage(
    `${getCallStackTrace()}: Reading book=${book}, chapter=${chapter}, verses=${JSON.stringify(versesArray)}, language=${language}`
  );

  const results = [];

  // =========================
  // Fetch verses
  // =========================

  for (const verse of versesArray) {

    let verseText =
      localBibleSingleVerselookup(
        book,
        chapter,
        verse,
        language,
        bible
      );

    logMessage(
      `${getCallStackTrace()}: Succcessfuly!!! one verse return = ${verseText}, for book = ${book}, chapter = ${chapter}, verse = ${verse}`
    );

    if (!verseText) {

      logMessageError(
        `${getCallStackTrace()}: Missing verse → ${book} ${chapter}:${verse}`
      );

      continue;
    }

    // =========================
    // Clean verse text
    // =========================

    verseText =
      verseText.replace(
        /\[[a-zA-Z]\]/g,
        ""
      );

    logMessage(
      `${getCallStackTrace()}: Success → ${book} ${chapter}:${verse}`
    );

    // =========================
    // Handle partial verses
    // =========================

    const isPartial =
      /^\d+[a-zA-Z]/.test(
        verseText
      );

    if (isPartial) {

      try {

        const splitResult =
          splitVerseIntoABDeepSeekAPI(
            verseText
          );

        results.push(splitResult);

      } catch (err) {

        logMessageError(
          `${getCallStackTrace()}: Partial verse split failed → ${err}`
        );

        results.push(verseText);
      }

    } else {

      results.push(verseText);
    }
  }

  return results;
}