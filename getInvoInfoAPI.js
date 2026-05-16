/**
 * Main entry: get the invocation Bible reference from Gmail using any model.
 * @param {boolean} isTesting - Whether to use test email content.
 * @param {string} provider - "gemini", "deepseek", or "chatgpt".
 */
function getInvoInfoAPI(isTesting, provider = "gemini") {
  const emailContent = getInvoGmail(isTesting);

  if (emailContent === null) {
    logMessage(`${getCallStackTrace()}: ⚠️ No Invocation info found or Gmail retrieval failed.`);
    return null;
  }

  // Clean and truncate to avoid MAX_TOKENS
  const cleanedEmailContent = emailContent
    .replace(/<[^>]+>/g, " ")  // remove HTML tags
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim()
    .substring(0, 50000);        // limit to 50000 chars

  logMessage(`${getCallStackTrace()}: Cleaned invocation email content = ${JSON.stringify(cleanedEmailContent)}`);

  const extractedReference = callInvoInfoAPI(provider, cleanedEmailContent);
  logMessage(`${getCallStackTrace()}: Extracted Invocation Bible Reference = ${JSON.stringify(extractedReference)}`);

  return extractedReference;
}

/**
 * Core function to extract the Bible verse reference using selected model.
 * @param {string} provider - "gemini", "deepseek", or "chatgpt".
 * @param {string} emailContent - The cleaned email text.
 * @returns {string[]} - An array containing the first found reference or [].
 */
function callInvoInfoAPI(provider, emailContent) {
  // Call unified wrapper
  const prompt = buildInvoPrompt(provider, emailContent);
  const reply = runAllAI(provider, prompt);

  if (!reply) {
    logMessageError(`${getCallStackTrace()}: Empty response from ${provider}`);
    return [];
  }

  // Clean code block formatting if present
  const cleanReply = reply.replace(/^```json\s*|\s*```$/g, "").trim();
  logMessage(`${getCallStackTrace()}: Cleaned reply from ${provider}: ${cleanReply}`);

  // Safe JSON parse
  try {
    const parsed = JSON.parse(cleanReply);
    if (parsed.reference && Array.isArray(parsed.reference)) {
      return parsed.reference.slice(0, 1);
    } else {
      logMessage(`${getCallStackTrace()}: No valid verse found in ${provider} output.`);
      return [];
    }
  } catch (e) {
    logMessageError(`${getCallStackTrace()}: Failed to parse JSON from ${provider} output. Raw reply = ${cleanReply}`);
    return [];
  }
}

function buildInvoPrompt(provider, emailContent) {
  const basePrompt = `
You are an expert at extracting the INVOCATION (Call to Worship) Bible passage
from long bilingual (Chinese–English) church email threads.

PRIMARY TASK (STRICT):
Find the Bible passage that is explicitly marked as the INVOCATION, such as lines containing:
- "Call to worship"
- "Invocation"
- "經文" (when clearly used for opening worship)

CRITICAL RULES:
- IGNORE sermon passages marked by words like:
  "Text:", "Sermon Text", "講道經文", "Title:", or "Main idea".
- IGNORE instructional examples or placeholders (e.g. "詩篇 Psalm 1xx:1-5", "xx").
- Only accept passages that are clearly intended to be READ as the opening worship scripture.

If multiple invocation lines exist, return the FIRST one in reading order.

OUTPUT FORMAT (JSON ONLY):
{"reference":["詩篇 Psalm 95:1-6"]}

If NO invocation passage is found, return:
{"reference":[]}

Do NOT include explanations, markdown, or any text outside JSON.

Email content:
${emailContent}
`.trim();

  switch (provider.toLowerCase()) {
    case "gemini":
      return basePrompt + "\nReturn ONLY JSON. No code fences, no markdown.";
    case "deepseek":
      return basePrompt + "\nRespond ONLY in JSON text. Do NOT add ```json``` or commentary.";
    case "chatgpt":
      return basePrompt + "\nRespond strictly in JSON, without markdown or explanations.";
    default:
      return basePrompt;
  }
}

