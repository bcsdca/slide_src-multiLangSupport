/*function testGeminiSimple() {
  const prompt = "Translate 'God is love' into Traditional Chinese (CUVMPT Bible style).";
  const result = callGemini(prompt);
  logMessage(`${getCallStackTrace()}: ${result}`);
}

// --- Helper: call Gemini ---
function callGemini(prompt, temperature = 0.7) {
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature }
  };

  const url = `${geminiAPIUrl}?key=${geminiAPIKey}`;
  const options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const text = response.getContentText(); // raw JSON
    logMessage(`${getCallStackTrace()}: Raw Gemini response:\n" + ${text}`);

    const json = JSON.parse(text);
    const reply =
      json?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        ?.filter(Boolean)
        ?.join('\n')
        ?.trim() || "";

    return reply;
  } catch (error) {
    logMessage(`${getCallStackTrace()}: Gemini error: ${error.message}`);
    return "";
  }
}

function listGeminiModels() {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${geminiAPIKey}`;
  const options = {
    method: "get",
    contentType: "application/json",
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const text = response.getContentText();
  logMessage(`${getCallStackTrace()}: List Models Response:\n" + ${text}`);
}
*/
