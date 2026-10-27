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
You are a deterministic text extraction engine.

Task:
Extract ONLY the bulletin announcement numbers that the MC is asked to highlight.

IMPORTANT:
The text may come from email or PDF extraction.
Line breaks, spacing, and "*" characters may be unreliable.

There are TWO valid formats.

FORMAT A:
1. # 2 長青團契
2. # 3 主任牧師聘牧委員會

For FORMAT A:
- The leading number before "#" is only a list position.
- The REAL announcement number is the number AFTER "#".
- Therefore:
  "1. # 2 ..." = announcement 2
  "2. # 3 ..." = announcement 3

FORMAT B:
1. # 粵語部傳道聘牧最近消息
2. # 新的秋季主日學
3. # 宣教主日午餐會
4. # 科技業求職與職涯發展策略講座

For FORMAT B:
- There is NO number after "#".
- Therefore the leading number before "." IS the announcement number.
- Thus the examples above represent announcements 1, 2, 3, and 4.

DECISION RULE:
For each item containing "#":

1. If "#" is followed by a number:
   use the number AFTER "#".

2. If "#" is NOT followed by a number:
   use the leading number BEFORE ".".

RULES:
1. Ignore all "*" characters and decorative formatting.
2. Look only at the MC / "Please highlight" announcement section.
3. Do NOT depend on line breaks.
4. Do NOT extract dates, Bible verse numbers, phone numbers, or numbers from normal sentences.
5. Stop when reaching closing text such as:
   "AV",
   "Audio-Visual",
   "Thanks",
   "In His service",
   "By His Grace".
6. Do NOT infer or invent numbers.
7. Preserve the order in which announcement numbers appear.
8. If none are found, return an empty array.

Return ONLY JSON in this structure:

{ "numbers": [] }

Put the extracted announcement numbers inside the array.
Do NOT copy the example values from this prompt.
Do NOT include explanations or markdown.

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

