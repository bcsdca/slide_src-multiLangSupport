/**
 * Build a AIToolChosen-specific Bible passage extraction prompt.
 * @param {string} AIToolChosen - AI provider (gemini, deepseek, chatgpt)
 * @param {string} passage - Bible passage (e.g., "John 3:16-18")
 * @param {string} language - "chinese" or "english"
 */
function buildBiblePassagePrompt(AIToolChosen, passage, language) {
  const lang = (language || "").toLowerCase();

  const isChinese = lang === "chinese";
  const isEnglish = lang === "english";

  if (!isChinese && !isEnglish) {
    throw new Error(`Invalid language: ${language}. Must be "chinese" or "english".`);
  }

  const basePrompt = `
You are a Bible reference validator and text retriever.

CRITICAL CONSTRAINT (OVERRIDES ALL OTHER INSTRUCTIONS):

- You are NOT allowed to generate, paraphrase, rewrite, modernize wording, normalize vocabulary, or improve the text.
- You may ONLY output an EXACT, character-for-character reproduction of the required Bible version.
- If you are unsure of even ONE character, punctuation mark, quotation mark, or word order, you MUST output an empty array and NOTHING else.

Task:
Return ONE array for the passage ${passage}.

${isChinese ? `
Language: Traditional Chinese
- Source MUST be Chinese Union Version with Modern Punctuation, Traditional Chinese (CUVMPT).
- Preserve all modern punctuation, including 「 」, ， 。 ？ ！.

- Each array element MUST be a SINGLE STRING containing BOTH:
  • the verse number
  • and the full verse text

- Each array element MUST start with the verse number followed by a space.
- The verse number and verse text MUST be on the SAME LINE.

- DO NOT separate the verse number and verse text into different elements.
- DO NOT output the verse number as a standalone element.

- VALID FORMAT EXAMPLE:
  ["12 耶穌說：「你們來吃早飯。」"]

- INVALID FORMAT EXAMPLE (DO NOT DO THIS):
  ["12", "耶穌說：「你們來吃早飯。」"]

- Verse numbers MUST be verse-only (e.g., "8", NOT "1:8").
- Including chapter numbers is STRICTLY FORBIDDEN.
- DO NOT include （細拉）、段落標題、或任何編輯說明.

- If the requested verse includes a suffix (e.g., "6a" or "6b"):

  1. You MUST preserve the suffix in the output verse number (e.g., "6a", NOT "6").

  2. The result MUST still follow the SAME single-string rule:
     • Example: "6a 不喜歡不義"

  3. Split the verse strictly at the FIRST major punctuation mark (，；。！？):
     • "a" = text BEFORE the punctuation
     • "b" = text AFTER the punctuation

  4. If no such punctuation exists:
     • Return the FULL verse
     • BUT still label it with the requested suffix (e.g., "6a")
` : ""}

${isEnglish ? `
Language: English
Language: English
- Source MUST be New International Version (NIV).
- Preserve all punctuation and quotation marks exactly.

- Each array element MUST be a SINGLE STRING containing BOTH:
  • the verse number
  • and the full verse text

- Each array element MUST start with the verse number followed by a space.
- The verse number and verse text MUST be on the SAME LINE.

- DO NOT separate the verse number and verse text into different elements.
- DO NOT output the verse number as a standalone element.

- VALID FORMAT EXAMPLE:
  ["6 Love does not delight in evil but rejoices with the truth."]

- INVALID FORMAT EXAMPLE (DO NOT DO THIS):
  ["6", "Love does not delight in evil but rejoices with the truth."]

- Verse numbers MUST be verse-only (e.g., "8", NOT "1:8").

- If the requested verse includes a suffix (e.g., "6a" or "6b"):

  1. You MUST preserve the suffix in the output verse number (e.g., "6a", NOT "6").

  2. The result MUST still follow the SAME single-string rule:
     • Example: "6a Love does not delight in evil"

  3. Split rule (STRICT PRIORITY ORDER — MUST follow exactly):

     Step 1: Try to split at the FIRST punctuation mark:
       • comma (,)
       • semicolon (;)
       • period (.)
       • question mark (?)
       • exclamation mark (!)

     Step 2: If NO punctuation exists, you MUST split at the FIRST occurrence of a coordinating conjunction:
       • but
       • and
       • for
       • so
       • yet

     Step 3: If no valid split point exists:
       • Return the FULL verse
       • BUT still label it with the requested suffix (e.g., "6a")

  4. Split output rules:
     • "a" = text BEFORE the split point
     • "b" = text AFTER the split point
` : ""}

Rules:
- Only include verses strictly within ${passage}.
- Do NOT include Psalm superscriptions or section headers.

Output format (JSON only):
${isChinese ? `{"chinese": []}` : `{"english": []}`}
`.trim();

  switch ((AIToolChosen || "").toLowerCase()) {
    case "gemini":
      return basePrompt + "\nRespond ONLY with valid JSON. No markdown or code blocks.";
    case "deepseek":
      return basePrompt + "\nReturn pure JSON only. No ```json``` or commentary.";
    case "chatgpt":
      return basePrompt + "\nOutput ONLY valid JSON. No explanations.";
    default:
      return basePrompt;
  }
}