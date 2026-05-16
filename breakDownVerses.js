/*function breakDownVerses(input) {
  logMessage(`${getCallStackTrace()}: Input = ${input}`);
  if (typeof input !== 'string') return [];

  const parts = input.split(/[,，]/).map(p => p.trim());
  const result = [];

  for (const part of parts) {
    const range = part.split('-').map(p => p.trim());

    if (range.length === 1) {
      const val = range[0];
      if (/^\d+$/.test(val)) {
        result.push(Number(val));
      } else {
        result.push(val);
      }
    } else if (range.length === 2) {
      const [startStr, endStr] = range;

      const startNum = parseInt(startStr, 10);
      const endNum = parseInt(endStr, 10);

      // If start or end is invalid, skip
      if (isNaN(startNum) || isNaN(endNum)) {
        console.warn(`Invalid range: ${part}`);
        continue;
      }

      // Determine if start or end has letters
      const startIsAlpha = /[a-zA-Z]/.test(startStr);
      const endIsAlpha = /[a-zA-Z]/.test(endStr);

      if (startIsAlpha && endIsAlpha) {
        // Case: "1b-2a"
        result.push(startStr); // e.g., "1b"
        for (let i = startNum + 1; i < endNum; i++) {
          result.push(i);
        }
        result.push(endStr); // e.g., "2a"
      } else if (startIsAlpha && !endIsAlpha) {
        // Case: "1b-6"
        result.push(startStr); // e.g., "1b"
        for (let i = startNum + 1; i <= endNum; i++) {
          result.push(i);
        }
      } else if (!startIsAlpha && endIsAlpha) {
        // Case: "8-10a"
        for (let i = startNum; i < endNum; i++) {
          result.push(i);
        }
        result.push(endStr); // e.g., "10a"
      } else {
        // Normal numeric range (e.g. "3-5")
        const [from, to] = startNum <= endNum ? [startNum, endNum] : [endNum, startNum];
        for (let i = from; i <= to; i++) {
          result.push(i);
        }
      }
    } else {
      logMessageError(`Invalid format: ${part}`);
    }
  }

  logMessage(`${getCallStackTrace()}: Verses Array = ${JSON.stringify(result)}`);
  return result;
}
*/
function breakDownVerses(input) {
  logMessage(`${getCallStackTrace()}: Input = ${input}`);
  if (typeof input !== 'string') return [];

  const parts = input.split(/[,，]/).map(p => p.trim());
  const result = [];

  for (const part of parts) {
    const range = part.split('-').map(p => p.trim());

    if (range.length === 1) {
      const val = range[0];
      if (/^\d+$/.test(val)) {
        result.push(Number(val));
      } else {
        result.push(val);
      }

    } else if (range.length === 2) {
      const [startStr, endStr] = range;

      const startNum = parseInt(startStr, 10);
      const endNum = parseInt(endStr, 10);

      // If start or end is invalid, skip
      if (isNaN(startNum) || isNaN(endNum)) {
        console.warn(`Invalid range: ${part}`);
        continue;
      }

      // Determine if start or end has letters
      const startIsAlpha = /[a-zA-Z]/.test(startStr);
      const endIsAlpha = /[a-zA-Z]/.test(endStr);

      // =========================
      // SPECIAL CASES (same verse)
      // =========================
      if (startNum === endNum && startIsAlpha && endIsAlpha) {
        if (startStr === endStr) {
          // Case: "1a-1a"
          result.push(startStr);
        } else {
          // Case: "3a-3b"
          result.push(startNum);
        }
        continue;
      }

      if (startIsAlpha && endIsAlpha) {
        // Case: "1b-2a"
        result.push(startStr); // e.g., "1b"
        for (let i = startNum + 1; i < endNum; i++) {
          result.push(i);
        }
        result.push(endStr); // e.g., "2a"

      } else if (startIsAlpha && !endIsAlpha) {
        // Case: "1b-6"
        result.push(startStr); // e.g., "1b"
        for (let i = startNum + 1; i <= endNum; i++) {
          result.push(i);
        }

      } else if (!startIsAlpha && endIsAlpha) {
        // Case: "8-10a"
        for (let i = startNum; i < endNum; i++) {
          result.push(i);
        }
        result.push(endStr); // e.g., "10a"

      } else {
        // Normal numeric range (e.g. "3-5")
        const [from, to] = startNum <= endNum ? [startNum, endNum] : [endNum, startNum];
        for (let i = from; i <= to; i++) {
          result.push(i);
        }
      }

    } else {
      logMessageError(`Invalid format: ${part}`);
    }
  }

  logMessage(`${getCallStackTrace()}: Verses Array = ${JSON.stringify(result)}`);
  return result;
}
