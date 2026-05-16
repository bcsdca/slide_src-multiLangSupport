function mergeBilingualSlides(
  chineseArray,
  englishArray,
  languageChosen,
  fontProfile
) {

  const combined = [];

  // =========================================================
  // LANGUAGE MODE FLAGS
  // =========================================================

  const isBilingual =
    languageChosen === "bilingualChineseFirst" ||
    languageChosen === "bilingualEnglishFirst";

  const englishFirst =
    languageChosen === "bilingualEnglishFirst";

  // =========================================================
  // CONFIG
  // =========================================================

  const config =
    isBilingual
      ? SLIDE_CONFIG[fontProfile].bilingual
      : SLIDE_CONFIG[fontProfile][languageChosen];

  logMessage(`
${getCallStackTrace()}: 🎬 ${languageChosen.toUpperCase()} MODE, and the font profile of ${fontProfile}

Font profile:
"${fontProfile}"

Bilingual order:
"${englishFirst ? "ENGLISH_FIRST" : "CHINESE_FIRST"}"
`);

  // =========================================================
  // 🟩 BILINGUAL MODE
  // =========================================================

  if (isBilingual) {

    const cnMax =
      config.chinese.maxCharsPerLine;

    const enMax =
      config.english.maxCharsPerLine;

    const maxLines =
      config.maxLinesPerSlide;

    let p = 0;

    while (p < chineseArray.length) {

      let usedLines = 0;

      const slideCN = [];
      const slideEN = [];

      logMessage(`
========================
📄 NEW BILINGUAL SLIDE
========================`);

      // =====================================================
      // PACK MULTIPLE SMALL PAIRS
      // =====================================================

      while (p < chineseArray.length) {

        let cnVerse =
          (chineseArray[p] || "").normalize("NFC");

        let enVerse =
          (englishArray[p] || "").normalize("NFC");

        const cnLines =
          cnVerse
            ? Math.ceil(cnVerse.length / cnMax)
            : 0;

        const enLines =
          enVerse
            ? Math.ceil(enVerse.length / enMax)
            : 0;

        const pairLines =
          cnLines + enLines;

        const projected =
          usedLines + pairLines;

        logMessage(`
📖 PROCESS PAIR ${p}
--------------------------------
CN:
"${cnVerse}"

EN:
"${enVerse}"

CN lines: ${cnLines}
EN lines: ${enLines}

Pair total:
${pairLines}

Current usage:
${usedLines}/${maxLines}

Projected:
${projected}/${maxLines}
--------------------------------`);

        // =====================================================
        // PAIR FITS ENTIRELY
        // =====================================================

        if (projected <= maxLines) {

          if (cnVerse) {
            slideCN.push(cnVerse);
          }

          if (enVerse) {
            slideEN.push(enVerse);
          }

          usedLines += pairLines;

          logMessage(`
✅ PAIR FULLY FITS

usedLines=${usedLines}/${maxLines}`);

          p++;
          continue;
        }

        // =====================================================
        // CURRENT SLIDE ALREADY HAS CONTENT
        // =====================================================

        if (usedLines > 0) {

          logMessage(`
🚧 NEXT PAIR DOES NOT FIT

Finalize current slide first`);

          break;
        }

        // =====================================================
        // LONG PAIR MODE
        // =====================================================

        logMessage(`
🔥 LONG PAIR MODE

Pair exceeds single slide
Will spill across slides`);

        const stream = [];

        if (englishFirst) {

          // EN first
          if (enVerse) {
            stream.push({
              text: enVerse,
              lang: "en"
            });
          }

          if (cnVerse) {
            stream.push({
              text: cnVerse,
              lang: "cn"
            });
          }

        } else {

          // CN first
          if (cnVerse) {
            stream.push({
              text: cnVerse,
              lang: "cn"
            });
          }

          if (enVerse) {
            stream.push({
              text: enVerse,
              lang: "en"
            });
          }
        }

        let sIndex = 0;

        // =====================================================
        // CONSUME THIS PAIR EXCLUSIVELY
        // =====================================================

        while (sIndex < stream.length) {

          let pairSlideUsed = 0;

          const pairSlideCN = [];
          const pairSlideEN = [];

          logMessage(`
📄 NEW LONG-PAIR SLIDE
(pair ${p})
--------------------------------`);

          while (sIndex < stream.length) {

            const item = stream[sIndex];

            const maxChars =
              item.lang === "cn"
                ? cnMax
                : enMax;

            const lines =
              Math.ceil(
                item.text.length / maxChars
              );

            const pairProjected =
              pairSlideUsed + lines;

            logMessage(`
➡️ PROCESS ${item.lang.toUpperCase()}
--------------------------------
"${item.text}"

Lines needed:
${lines}

Current usage:
${pairSlideUsed}/${maxLines}

Projected:
${pairProjected}/${maxLines}
--------------------------------`);

            // ===============================================
            // FULLY FITS
            // ===============================================

            if (pairProjected <= maxLines) {

              if (item.lang === "cn") {
                pairSlideCN.push(item.text);
              } else {
                pairSlideEN.push(item.text);
              }

              pairSlideUsed += lines;

              sIndex++;

              logMessage(`
✅ FULL BLOCK FITS

pairSlideUsed=${pairSlideUsed}/${maxLines}`);

              continue;
            }

            // ===============================================
            // SPLIT REQUIRED
            // ===============================================

            const remainingLines =
              maxLines - pairSlideUsed;

            logMessage(`
🔥 OVERFLOW DETECTED
--------------------------------
Remaining lines:
${remainingLines}

Will split dynamically
--------------------------------`);

            const [fit, rest] =
              splitChunkByLines(
                item.text,
                maxChars,
                remainingLines
              );

            if (fit) {

              if (item.lang === "cn") {
                pairSlideCN.push(fit);
              } else {
                pairSlideEN.push(fit);
              }

              logMessage(`
✂️ FIT PORTION
--------------------------------
"${fit}"
--------------------------------`);
            }

            logMessage(`
➡️ REMAINING FOR NEXT SLIDE
--------------------------------
"${rest}"
--------------------------------`);

            stream[sIndex].text = rest;

            break;
          }

          combined.push(
            buildBilingualSlide(
              pairSlideCN,
              pairSlideEN,
              englishFirst
            )
          );

          logMessage(`
✅ LONG PAIR SLIDE CREATED
--------------------------------
CN blocks:
${pairSlideCN.length}

EN blocks:
${pairSlideEN.length}

Lines used:
${pairSlideUsed}/${maxLines}
--------------------------------`);
        }

        // long pair done
        p++;

        // IMPORTANT:
        // next pair starts NEW slide

        usedLines = 0;

        slideCN.length = 0;
        slideEN.length = 0;

        break;
      }

      // =====================================================
      // NORMAL PACKED SLIDE
      // =====================================================

      if (slideCN.length || slideEN.length) {

        combined.push(
          buildBilingualSlide(
            slideCN,
            slideEN,
            englishFirst
          )
        );

        logMessage(`
✅ NORMAL BILINGUAL SLIDE CREATED
--------------------------------
CN blocks:
${slideCN.length}

EN blocks:
${slideEN.length}

Lines used:
${usedLines}/${maxLines}
--------------------------------`);
      }
    }

    return combined;
  }

  // =========================================================
  // 🟦 SINGLE LANGUAGE MODE
  // =========================================================

  const source =
    languageChosen === "chinese"
      ? chineseArray
      : englishArray;

  const maxChars =
    config.maxCharsPerLine;

  const maxLines =
    config.maxLinesPerSlide;

  let v = 0;

  while (v < source.length) {

    let usedLines = 0;

    const slide = [];

    logMessage(`
========================
📄 NEW SLIDE
========================`);

    while (v < source.length) {

      let verse =
        (source[v] || "").normalize("NFC");

      const verseLines =
        Math.ceil(verse.length / maxChars);

      const projected =
        usedLines + verseLines;

      logMessage(`
📖 PROCESS VERSE ${v}
--------------------------------
"${verse}"

Verse lines:
${verseLines}

Current usage:
${usedLines}/${maxLines}

Projected:
${projected}/${maxLines}
--------------------------------`);

      // =====================================================
      // VERSE FITS
      // =====================================================

      if (projected <= maxLines) {

        slide.push(verse);

        usedLines += verseLines;

        logMessage(`
✅ VERSE FITS

usedLines=${usedLines}/${maxLines}`);

        v++;
        continue;
      }

      // =====================================================
      // CURRENT SLIDE HAS CONTENT
      // =====================================================

      if (usedLines > 0) {

        logMessage(`
🚧 SLIDE FULL

Finalize current slide`);

        break;
      }

      // =====================================================
      // LONG VERSE MODE
      // =====================================================

      logMessage(`
🔥 LONG VERSE MODE

Verse exceeds single slide
Will spill across slides`);

      while (verse.length > 0) {

        const [fit, rest] =
          splitChunkByLines(
            verse,
            maxChars,
            maxLines
          );

        combined.push([fit]);

        const fitLines =
          Math.ceil(fit.length / maxChars);

        logMessage(`
✅ LONG VERSE SLIDE CREATED
--------------------------------
"${fit}"

Lines used:
${fitLines}/${maxLines}
--------------------------------`);

        verse = rest;
      }

      v++;

      usedLines = 0;
      slide.length = 0;

      break;
    }

    if (slide.length > 0) {

      combined.push(slide);

      logMessage(`
✅ NORMAL SLIDE CREATED
--------------------------------
Verses:
${slide.length}

Lines used:
${usedLines}/${maxLines}
--------------------------------`);
    }
  }

  return combined;
}

// =========================================================
// BUILD BILINGUAL SLIDE
// =========================================================

function buildBilingualSlide(
  slideCN,
  slideEN,
  englishFirst
) {

  return englishFirst
    ? [...slideEN, ...slideCN]
    : [...slideCN, ...slideEN];
}

// =========================================================
// SMART SPLIT
// =========================================================

function splitChunkByLines(
  text,
  maxCharsPerLine,
  allowedLines
) {

  const maxChars =
    maxCharsPerLine * allowedLines;

  if (text.length <= maxChars) {
    return [text, ""];
  }

  let splitIndex = maxChars;

  // avoid splitting English words

  while (
    splitIndex > 0 &&
    /[A-Za-z]/.test(text[splitIndex]) &&
    /[A-Za-z]/.test(text[splitIndex - 1])
  ) {
    splitIndex--;
  }

  if (splitIndex === 0) {
    splitIndex = maxChars;
  }

  const fit =
    text.slice(0, splitIndex).trim();

  const rest =
    text.slice(splitIndex).trim();

  logMessage(`
✂️ SMART SPLIT
--------------------------------
maxChars=${maxChars}

splitIndex=${splitIndex}

FIT:
"${fit}"

REST:
"${rest}"
--------------------------------`);

  return [fit, rest];
}