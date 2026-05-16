/**
 * Extract worship service information (scripture, sermon, speaker) from Gmail
 * using Gemini, DeepSeek, or ChatGPT.
 * @param {boolean} isTesting - Whether to use test Gmail data.
 * @param {string} provider - "gemini", "deepseek", or "chatgpt".
 * @returns {object|null} worshipInfo JSON or null on failure.
 */
function getWorshipInfoAPI(isTesting, provider = "gemini") {
  // 1️⃣ Get Gmail content (HTML format)
  const worshipGmailInfo = getWorshipHTMLGmail(isTesting);
  if (!worshipGmailInfo.success) {
    logMessage(`${getCallStackTrace()}: ⚠️ No worship info found or Gmail retrieval failed.`);
    return null;
  }

  // 2️⃣ Clean and truncate email body for token safety
  const cleanedEmailBody = worshipGmailInfo.message
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 4000);

  logMessage(`${getCallStackTrace()}: ✂️ Cleaned email body to 4000 chars.`);
  logMessage(`${getCallStackTrace()}: Cleaned email body content = ${cleanedEmailBody}`);

  // 3️⃣ Build provider-specific prompt
  const prompt = buildWorshipPrompt(provider, cleanedEmailBody);

  // 4️⃣ Call the unified runner (Gemini / DeepSeek / ChatGPT)
  const reply = runAllAI(provider, prompt);
  if (!reply) {
    logMessageError(`${getCallStackTrace()}: Empty response from ${provider}`);
    return null;
  }

  // 5️⃣ Clean JSON formatting
  let textContent = reply.replace(/^```json\s*|\s*```$/g, "").trim();
  if (!textContent.endsWith("}")) textContent += "}";

  logMessage(`${getCallStackTrace()}: 🧩 Cleaned model reply = ${textContent}`);

  // 6️⃣ Parse JSON safely
  let worshipInfo;
  try {
    worshipInfo = JSON.parse(textContent);
  } catch (parseError) {
    logMessageError(`${getCallStackTrace()}: ❌ Failed to parse JSON from ${provider}: ${textContent}`);
    return null;
  }

  // 7️⃣ Validate required fields
  const required = ["scriptureReading", "sermon", "speaker"];
  const missing = required.filter(k => !worshipInfo[k]);
  if (missing.length > 0) {
    logMessageError(`${getCallStackTrace()}: Missing fields: ${missing.join(", ")}`);
    return null;
  }

  // 8️⃣ Extract announcement numbers (using unified function)
  const annoArray = getOldestAnnouncementNumbersAPI(worshipGmailInfo.message, provider);
  worshipInfo.annoArray = annoArray;
  worshipInfo.attachment = worshipGmailInfo.attachment;

  // 9️⃣ Log and return
  logMessage(`${getCallStackTrace()}: ✅ worshipInfo = ${JSON.stringify(worshipInfo, null, 2)}`);
  return worshipInfo;
}

/**
 * Build provider-specific prompt for worship extraction.
 */
function buildWorshipPrompt(provider, cleanedEmailBody) {
  const basePrompt = `
  You are a precise data extractor.

  From the following worship service email (cleaned text), extract ONLY the FIRST occurrence, and including the whole line of:

  1. Scripture Reading (look for "讀經" or "Scripture Reading")
  2. Sermon Title (look for "證道" or "Sermon")
  3. Speaker (look for "講員" or "Speaker")

  Remove all "*" characters and include the full line for each field.

  Return ONLY a valid JSON object in this exact structure (no markdown, no commentary):

  {
    "scriptureReading": "extracted text",
    "sermon": "extracted text",
    "speaker": "extracted text"
  }

  Email content:
  ${cleanedEmailBody}
  `
  .trim();

  switch (provider.toLowerCase()) {
    case "gemini":
      return basePrompt + "\nRespond only with JSON. No markdown, no ```json``` blocks.";
    case "deepseek":
      return basePrompt + "\nOutput strictly in raw JSON text, no markdown formatting.";
    case "chatgpt":
      return basePrompt + "\nReturn only JSON, no explanations or code fences.";
    default:
      return basePrompt;
  }
}
