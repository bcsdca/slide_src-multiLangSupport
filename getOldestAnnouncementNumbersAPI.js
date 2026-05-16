/**
 * Extract all announcement numbers from the oldest bulletin section using any model.
 * @param {string} message - The full bulletin message (HTML or text).
 * @param {string} provider - "gemini", "deepseek", or "chatgpt".
 * @returns {number[]} Array of announcement numbers.
 */
function getOldestAnnouncementNumbersAPI(message, provider = "gemini") {
  // 1️⃣ Isolate the oldest message section
  const oldestMessage = message.split('Please highlight the following items from the bulletin:').pop() || "";
  logMessage(`${getCallStackTrace()}: oldestMessage length = ${oldestMessage.length}`);

  // 2️⃣ Clean and truncate for token safety
  const oldestMessageTruncated = oldestMessage
    .replace(/<[^>]+>/g, " ")   // remove HTML tags
    .replace(/\s+/g, " ")       // collapse whitespace
    .trim()
    .substring(0, 2000);

  logMessage(`${getCallStackTrace()}: Truncated oldestMessage = ${oldestMessageTruncated}`);
  logMessage(`${getCallStackTrace()}: Input length: ${oldestMessageTruncated.length} chars`);
  logMessage(`${getCallStackTrace()}: Approx tokens: ${Math.round(oldestMessageTruncated.length / 4)}`);

  // 3️⃣ Build provider-specific prompt
  const prompt = buildAnnouncementPrompt(provider, oldestMessageTruncated);

  // 4️⃣ Send prompt through unified API runner
  const reply = runAllAI(provider, prompt);
  if (!reply) {
    logMessageError(`${getCallStackTrace()}: Empty response from ${provider}`);
    return [];
  }

  // 5️⃣ Clean up model response (remove ```json``` etc.)
  let assistantContent = reply.replace(/^```json\s*|\s*```$/g, "").trim();
  if (!assistantContent.endsWith("}")) assistantContent += "}";

  logMessage(`${getCallStackTrace()}: assistantContent after cleaning: ${assistantContent}`);

  // 6️⃣ Parse and validate JSON
  try {
    const result = JSON.parse(assistantContent);
    const numbers = (result.numbers || [])
      .map(n => parseInt(n))
      .filter(n => !isNaN(n));

    logMessage(`${getCallStackTrace()}: ✅ Extracted announcement numbers = ${JSON.stringify(numbers)}`);
    return numbers;
  } catch (e) {
    logMessageError(`${getCallStackTrace()}: ❌ Failed to parse JSON from ${provider} output: ${assistantContent}`);
    return [];
  }
}

/**
 * Provider-specific prompt builder for announcements.
 */
function buildAnnouncementPrompt(provider, oldestMessageTruncated) {
const basePrompt = `
Extract ONLY the valid announcement numbers from the bulletin text below.

CRITICAL DEFINITIONS:
- Some announcements are written as a numbered list (e.g., "1.", "2.") but the REAL announcement number is the number that appears AFTER a "#" symbol.
- The leading list number (e.g., "1.", "2.") is NOT an announcement number and must be ignored.

RULES:
1. Ignore all "*" characters.
2. Only consider lines that start at the beginning of a line.
3. A valid announcement line:
   - May start with a list index like "1." or "2.", which must be ignored.
   - MUST contain a "#" followed immediately by a number (e.g., "# 2", "#3").
4. Extract ONLY the number that appears after "#".
5. Ignore any numbers that:
   - Appear in parentheses.
   - Appear within sentences.
   - Appear after words like "Announcement", "AV", "Audio-Visual", "MC", or "Thanks".
6. Stop processing entirely once you reach any section mentioning "AV", "Audio-Visual", "MC", or "Thanks".
7. Do NOT infer, renumber, or assume missing values.
8. Return strictly in JSON format and nothing else:

{ "numbers": [2, 3] }

CONTENT:
${oldestMessageTruncated}
`.trim();

  switch (provider.toLowerCase()) {
    case "gemini":
      return basePrompt + "\nReturn ONLY valid JSON, no markdown or commentary.";
    case "deepseek":
      return basePrompt + "\nOutput strictly in JSON, without ```json``` fences or explanations.";
    case "chatgpt":
      return basePrompt + "\nRespond only with JSON text, no markdown formatting.";
    default:
      return basePrompt;
  }
}

