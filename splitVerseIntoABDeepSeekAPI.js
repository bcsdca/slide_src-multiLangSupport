function splitVerseIntoABDeepSeekAPI(passage) {
  // Extract verse number and optional suffix (a or b)
  const verseMatch = passage.match(/^(\d+)([aAbB])?/);
  const verseNum = verseMatch ? verseMatch[1] : "";
  const suffix = verseMatch && verseMatch[2] ? verseMatch[2].toLowerCase() : "";

  // Remove leading verse label (e.g., 19a or 19) from the passage for API input
  const cleanPassage = passage.replace(/^\d+[aAbB]?\s*/, "");

  const payload = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are a strict JSON generator. You split Bible verses into meaningful parts labeled 'a' and 'b'. You MUST follow formatting rules exactly."
      },
      {
        role: "user",
        content: `Split this Bible verse into two meaningful parts labeled "a" and "b".

        Verse:
        ${cleanPassage}

          STRICT RULES:
            1. Return ONLY a valid JSON object.
            2. Do NOT include explanation, comments, or any extra text.
            3. Do NOT use markdown or code blocks.
            4. Do NOT include line breaks inside JSON string values.
            5. Always use this exact format:
              {"a": "...", "b": "..."}
            6. If the verse cannot be split, return:
              {"a": "${cleanPassage}"}

        Output:`
      }
    ],
    temperature: 0.2
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${deepSeekAPIKey}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(deepSeekAPIUrl, options);
    const json = JSON.parse(response.getContentText());
    const rawReply = json.choices[0].message.content;

    logMessage(`${getCallStackTrace()}: Raw API reply:\n${rawReply}`);

    const cleanedReply = rawReply.replace(/```[\s\S]*?```/g, match => {
      return match.replace(/```json|```/g, '').trim();
    });

    //const obj = JSON.parse(cleanedReply);
    const obj = extractJsonObject(rawReply);

    // Case: suffix is 'a' or 'b' and both parts exist
    if (obj.a && obj.b && (suffix === "a" || suffix === "b")) {
      //const cleanA = obj.a.replace(/^a\s*/i, "").replace(new RegExp(`^${verseNum}\\s*`), "").trim();
      //const cleanB = obj.b.replace(/^b\s*/i, "").replace(new RegExp(`^${verseNum}\\s*`), "").trim();
      const cleanA = obj.a.trim();
      const cleanB = obj.b.trim();
      const result = suffix === "a"
        ? `${verseNum}a ${cleanA}`
        : `${verseNum}b ${cleanB}`;
      logMessage(`${getCallStackTrace()}: Returning part '${suffix}' only: ${result}`);
      return result;
    }

    // Case: verse can be split but no suffix provided → return full original string
    if (obj.a && obj.b && !suffix) {
      logMessage(`${getCallStackTrace()}: No suffix specified. Returning original passage.`);
      return passage;
    }

    // Case: verse could not be split
    if (obj.a && !obj.b) {
      logMessage(`${getCallStackTrace()}: Verse could not be split. Returning original.`);
      return passage;
    }

    throw new Error("Unexpected format in DeepSeek response.");

  } catch (e) {
    logMessageError(`${getCallStackTrace()}: Failed to parse DeepSeek response: ${e}`);
    return passage;
  }
}

/*function extractJsonObject(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON object found in response");
  }

  let jsonString = text.substring(firstBrace, lastBrace + 1);

  // =========================
  // 🔥 FIX 1: remove control characters (except valid whitespace)
  // =========================
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  // =========================
  // 🔥 FIX 2: normalize smart quotes (optional but safer)
  // =========================
  jsonString = jsonString
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  // =========================
  // 🔥 FIX 3: remove trailing commas (common LLM issue)
  // =========================
  jsonString = jsonString.replace(/,\s*}/g, "}");

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    logMessageError(`${getCallStackTrace()}: ❌ JSON parse failed after cleanup:\n${jsonString}`);
    throw err;
  }
}
*/

function extractJsonObject(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON object found in response");
  }

  let jsonString = text.substring(firstBrace, lastBrace + 1);

  // Remove control chars
  jsonString = jsonString.replace(/[\u0000-\u001F]+/g, " ");

  // ❌ REMOVE smart quote normalization (causes breakage)

  // Remove trailing commas
  jsonString = jsonString.replace(/,\s*}/g, "}");

  // Fix duplicated quotes at end
  jsonString = jsonString.replace(/"\s*"\s*}/g, '"}');

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    logMessageError(`${getCallStackTrace()}: ❌ JSON parse failed after cleanup:\n${jsonString}`);
    throw err;
  }
}