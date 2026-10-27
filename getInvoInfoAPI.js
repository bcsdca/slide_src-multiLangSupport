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

* "Call to worship"
* "Invocation"
* "經文" (when clearly used for opening worship)

CRITICAL RULES:

* IGNORE sermon passages marked by words like:
  "Text:", "Sermon Text", "講道經文", "Title:", or "Main idea".
* Only accept passages that are clearly intended to be READ as the opening worship scripture.
* If multiple invocation lines exist, return the FIRST VALID one in reading order.

PLACEHOLDER REJECTION RULE — MANDATORY:

* A valid Bible reference MUST contain actual numeric chapter and verse numbers.
* NEVER return a reference containing placeholder characters in the chapter or verse portion.
* Reject placeholders such as:
  "x", "xx", "xxx", "1xx", "2xx", "chapter xx", "verse xx", or similar patterns.
* Examples that MUST be rejected:
  "詩篇 Psalms 1xx:1-5"
  "詩篇 Psalm xx:1-5"
  "Psalm x:1-5"
  "John 3:xx"
  "約翰福音 x:1-5"
* A line containing such a placeholder is an instructional example/template, NOT an actual invocation passage.
* If a placeholder reference appears before a real invocation reference, IGNORE the placeholder and continue searching for the real reference.

FINAL VALIDATION — REQUIRED BEFORE OUTPUT:
Before returning the selected reference:

1. Verify that the chapter number is a real integer.
2. Verify that the starting verse number is a real integer.
3. Verify that the ending verse number, if present, is a real integer.
4. Verify that the chapter/verse portion contains NO "x" or "X".
5. Verify that the reference came from an actual invocation/Call to Worship entry and not from an example, instruction, template, sermon passage, or placeholder.

If the candidate fails ANY of these checks, reject it and continue searching.

OUTPUT FORMAT (JSON ONLY):
{"reference":["詩篇 Psalm 95:1-6"]}

If NO valid invocation passage is found, return:
{"reference":[]}

Do NOT include explanations, markdown, commentary, or any text outside the JSON.

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

