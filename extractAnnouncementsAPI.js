/**
 * Extract specific numbered announcements from a bulletin PDF using any model.
 * @param {Blob} pdfBlob - Bulletin PDF file blob.
 * @param {number[]} annoArray - Array of announcement numbers to extract.
 * @param {string} provider - "gemini", "deepseek", or "chatgpt".
 * @returns {string[]} Array of extracted announcement texts.
 */
function extractAnnouncementsAPI(pdfBlob, annoArray, provider = "gemini") {
  const pdfText = extractTextFromPDFViaGoogleDoc(pdfBlob);
  const announcements = [];

  for (const number of annoArray) {
    const prompt = buildSingleAnnouncementPrompt(pdfText, number, provider);

    // 🧠 Unified call
    const reply = runAllAI(provider, prompt);

    if (!reply) {
      logMessageError(`${getCallStackTrace()}: ❌ Empty response for announcement #${number} from ${provider}`);
      continue;
    }

    // ✂️ Clean output
    let raw = reply.replace(/^```[\s\S]*?```$/g, "").trim();
    raw = raw.replace(/cec\s+sd\.org/gi, "cec-sd.org");

    announcements.push(raw);
    logMessage(`${getCallStackTrace()}: ✅ Extracted announcement #${number} (${provider}) = ${raw}`);
  }

  return announcements;
}

/**
 * Convert a PDF blob to plain text via Google Docs OCR conversion.
 */
function extractTextFromPDFViaGoogleDoc(blob) {
  const resource = {
    title: blob.getName(),
    mimeType: MimeType.GOOGLE_DOCS
  };

  const file = Drive.Files.insert(resource, blob, { convert: true });
  const doc = DocumentApp.openById(file.id);
  const text = doc.getBody().getText();

  // Auto-cleanup
  DriveApp.getFileById(file.id).setTrashed(true);
  logMessage(`${getCallStackTrace()}: 📄 PDF blob converted to Google Doc text (${text.length} chars).`);
  return text;
}

/**
 * Build a provider-specific prompt for extracting a single announcement.
 */
function buildSingleAnnouncementPrompt(pdfText, announcementNumber, provider) {
  const basePrompt = `
  You are a precise text extractor.

  Task:
  Extract ONLY announcement number ${announcementNumber} from the following church bulletin text.

  STRICT RULES:
  1. Ignore all asterisks (*) and decorative symbols.
  2. The announcement ALWAYS begins with:
     "${announcementNumber}. " followed by its title and content.
  3. The output MUST start with "${announcementNumber}." as the very first characters — no text, spaces, or punctuation before it.
  4. Stop extraction immediately before the next announcement number (like "${announcementNumber + 1}."), or before the end of the bulletin.
  5. Preserve exact original line breaks and spacing.
  6. Do NOT include any explanations, notes, or markdown.
  7. If the announcement number ${announcementNumber} does not exist, return an empty string ("").

  Output requirement:
  Return ONLY the raw text of announcement ${announcementNumber}, starting with "${announcementNumber}. ".

  BULLETIN TEXT:
  """${pdfText.substring(0, 15000)}"""
  `.trim();

  switch (provider.toLowerCase()) {
    case "gemini":
      return basePrompt + "\nRespond only with the extracted text — no code fences or metadata.";
    case "deepseek":
      return basePrompt + "\nOutput only raw text, no formatting or commentary.";
    case "chatgpt":
      return basePrompt + "\nReturn only the extracted text, no ``` formatting.";
    default:
      return basePrompt;
  }
}
