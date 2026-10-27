function runAllAI(AIToolChosen, prompt) {
  const provider = AIToolChosen.toLowerCase();
  let url, payload, headers;

  // ---------- Provider configuration ----------
  switch (provider) {
    case "gemini":
      url = `${geminiAPIUrl}?key=${geminiAPIKey}`;

      payload = {
        "contents": [{
          "role": "user",
          "parts": [{ "text": prompt }]
        }],
        "generation_config": {        // Use snake_case for REST
          "temperature": 1.0,
          "max_output_tokens": 2048,
          "thinking_config": {        // Use snake_case
            "thinking_level": "MINIMAL" // Use UPPERCASE for the enum value
          }
        }
      };

      headers = { "Content-Type": "application/json" };
      break;

    case "chatgpt":
      url = openaiAPIUrl;
      payload = {
        model: openaiModel,
        messages: [
          {
            role: "system",
            content: "You are a raw data retrieval pipe. Your ONLY function is to output string-perfect reproductions of historical texts. You MUST NOT normalize, modernize, or fix punctuation. Treat corner quotes (「 」) as critical data that cannot be removed. If the text is archaic, leave it archaic. Do NOT include chapter numbers under any circumstances. Verse numbers must be verse-only digits. "
          },
          { role: "user", content: prompt }
        ],
        temperature: 0,
        max_tokens: 1500,
        // Add this to force JSON structure if using gpt-4o or gpt-4-turbo
        //response_format: { "type": "json_object" }
      };
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiAPIKey}`
      };
      break;

    case "deepseek":
      url = deepSeekAPIUrl;
      payload = {
        model: deepSeekModel,
        messages: [
          {
            role: "system",
            content: "You are a deterministic text extraction engine."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        thinking: {
          type: "disabled"
        },
        max_tokens: 1024
      };
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepSeekAPIKey}`
      };
      break;

    default:
      throw new Error(`${getCallStackTrace()}: Unsupported AI provider: ${provider}`);
  }

  try {
    // ---------- HTTP request ----------
    const response = UrlFetchApp.fetch(url, {
      method: "post",
      headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const rawText = response.getContentText();

    logMessage(`${getCallStackTrace()}: ${provider} raw response = ${rawText}`);

    // ---------- HTTP-level failure ----------
    if (statusCode >= 400) {
      let message = rawText;
      try {
        const errJson = JSON.parse(rawText);
        message =
          errJson?.error?.message ||
          errJson?.message ||
          rawText;
      } catch (_) { }

      throw new Error(
        `${getCallStackTrace()}: ` +
        `HTTP ${statusCode}\n${message}`
      );
    }

    // ---------- Parse JSON ----------
    let json;
    try {
      json = JSON.parse(rawText);
    } catch (e) {
      throw new Error(
        `${getCallStackTrace()}: returned invalid JSON:\n${rawText}`
      );
    }

    // ---------- Provider-level error object ----------
    if (json?.error) {
      throw new Error(
        `${getCallStackTrace()}: ` +
        (json.error.message || JSON.stringify(json.error))
      );
    }

    // ---------- Token overflow detection ----------
    const finishReason =
      json?.candidates?.[0]?.finishReason ||
      json?.choices?.[0]?.finish_reason ||
      "";

    if (finishReason === "MAX_TOKENS" || finishReason === "length") {
      throw new Error(`${getCallStackTrace()}: aborted due to max token limit.`);
    }

    // ---------- Unified reply extraction ----------
    let reply = "";

    switch (provider) {
      case "gemini":
        reply =
          json?.candidates?.[0]?.content?.parts
            ?.map(p => p.text)
            ?.filter(Boolean)
            ?.join("\n")
            ?.trim() || "";

        // Remove ```json fences if present
        reply = reply.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        break;

      case "chatgpt":
      case "deepseek":
        reply = json?.choices?.[0]?.message?.content?.trim() || "";
        break;
    }

    // ---------- Empty reply guard ----------
    if (!reply) {
      throw new Error(`${getCallStackTrace()}: returned an empty reply.`);
    }

    return reply;

  } catch (err) {
    logMessageError(
      `${getCallStackTrace()}: fatal error:\n${err.message}`
    );
    throw err; // 🔥 propagate to FailureHandler
  }
}
