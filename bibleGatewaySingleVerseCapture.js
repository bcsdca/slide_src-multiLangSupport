//removing "（細拉）" before return (1/5/2023)
//taking care of the "-" in 使徒行傳 8:26 (3/6/2023)
//taking care of 以賽亞書 30:21 21 &amp;quot; /&amp;gt;你或向左或向右，你必聽見後邊有聲音說：「這是正路，要行在其間。」(6/10/2023)

function bibleGatewaySingleVerseCapture(book, chapter, verse) {
  /**
   * Captures a single verse from Bible Gateway
   * @param {string} book - The book of the Bible (e.g., "John").
   * @param {number} chapter - The chapter number.
   * @param {number} verse - The verse number.
   * @returns {string} - The verse content in Chinese or nothing is return if verse content not found.
   */
  const baseUrl = 'https://www.biblegateway.com/passage/';
  const url = `${baseUrl}?search=${book}+${chapter}:${verse}&version=CUVMPT`;
  logMessage(`${getCallStackTrace()}: Fetching URL: ${url}`);

  try {
    const response = UrlFetchApp.fetch(url);
    const content = response.getContentText();
    const sections = content.split('<div class=');

    //dumpArray(sections);

    // Priority: Look for "versenum" first, then "chapternum"
    // check versenum 1st when both are present like psalm 66:1
    const conditions = ['versenum', 'chapternum'];
    for (const condition of conditions) {
      for (const section of sections) {
        if (section.includes(`="${condition}"`)) {
          logMessage(`${getCallStackTrace()}: Section Found: ${section} for condition: ${condition} of verse ${verse}`);
          const verseContent = extractVerseContent(section, condition);
          logMessage(`${getCallStackTrace()}: Passage Found: verse ${verse}, verseContent: ${verseContent} of condition ${condition}`);
          return `${verse} ${verseContent}`;
        }
      }
      logMessage(`${getCallStackTrace()}: Can't find condition:${condition} for all sections for verse ${verse}.`);
    }

    logMessageError(`${getCallStackTrace()}: Verse NOT found for Book: ${book}, Chapter: ${chapter}, Verse: ${verse}`);
    //return will be undefined
    //return `${verse} ${verseContent}`;
  } catch (error) {
    //return will be undefined
    logMessageError(`${getCallStackTrace()}: Error - ${error.message}`);
    //return `${verse} ${verseContent}`;
  }
}

function extractVerseContent(section, condition) {
  /**
   * Extracts Chinese verse content from all <p> elements containing a specific condition.
   * @param {string} section - The HTML section containing the verses.
   * @param {string} condition - The condition to check (e.g., '="chapternum"' or '="versenum"').
   * @returns {string} - The cleaned, combined Chinese verse content.
   */
  /**
   * the following is the example that broke the original extractVerseContent function
   * it has 2 paragraphs
   * <p> 
   * <span id="zh-CUVMPT-27220" class="text Acts-10-23">
   * <sup class="versenum">23 </sup>
   * <u class="person underline">彼得</u>就請他們進去，住了一宿。
   * </span>
   * </p>

  * <h3><span class="text Acts-10-23">彼得往哥尼流家傳道</span></h3>

  * <p>
  * <span class="text Acts-10-23">
  *  次日起身和他們同去，還有<span class="place double-underline">約帕</span>的幾個弟兄同著他去。
  * </span>
  * </p>
  */
  try {
    const regex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    const matches = [...section.matchAll(regex)];

    if (!matches.length) {
      console.warn(`${getCallStackTrace()}: No <p> elements found.`);
      return '';
    }

    // Find the first <p> with the condition (e.g., versenum)
    let startIndex = matches.findIndex(m => m[0].includes(condition));

    if (startIndex === -1) {
      console.warn(`${getCallStackTrace()}: No <p> elements found with condition "${condition}".`);
      return '';
    }

    // Extract all paragraphs from startIndex to the end of matches
    let combinedText = '';

    for (let i = startIndex; i < matches.length; i++) {
      let verseContent = matches[i][1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/^[\s\d\u00A0]+/, '') // Remove all digits, spaces, & non-breaking spaces at start
        .replace(/（細拉）/g, '')
        .replace(/細拉/g, '')
        .trim();

      if (verseContent) {
        combinedText += verseContent + ' ';
      }
    }

    combinedText = combinedText.trim();
    logMessage(`${getCallStackTrace()}: Extracted Chinese Verse: "${combinedText}"`);
    return combinedText;

  } catch (error) {
    logMessageError(`${getCallStackTrace()}: Error - ${error.message}`);
    return '';
  }
}



