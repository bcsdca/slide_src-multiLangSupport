function splitPassage(text) {

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  logMessage(
    `${getCallStackTrace()}: Start working on passage : ${JSON.stringify(text)}`
  );

  // 1. Always split by semicolon first
  var passage = text.split(/；|;/);

  // 2. If no semicolon split happened
  if (passage.length === 1) {

    const bookRegex = new RegExp(
      ChineseBibleBookOrder
        .sort((a, b) => b.length - a.length)
        .join("|"),
      "g"
    );

    const matches = [...text.matchAll(bookRegex)];

    if (matches.length > 1) {

      let positions = matches.map(m => m.index);

      passage = [];

      for (let i = 0; i < positions.length; i++) {

        let start = positions[i];

        let end = (i + 1 < positions.length)
          ? positions[i + 1]
          : text.length;

        passage.push(
          text.substring(start, end).trim()
        );
      }

      logMessage(
        `${getCallStackTrace()}: Detected multiple Chinese book occurrences, split into passages = ${JSON.stringify(passage)}`
      );
    }
  }

  // Remove trailing punctuation from each passage
  passage = passage.map(p =>
    p.replace(/[，。,；;:：\s]+$/, "").trim()
  );

  logMessage(
    `${getCallStackTrace()}: Final split passages = ${JSON.stringify(passage)}`
  );

  return passage;
}