/*******************************************************
 * CONFIG
 *******************************************************/
const BATCH_SIZE = 3; // 3 books per run
const OUTPUT_FILE_NAME = "bible.json";


/*******************************************************
 * MAIN BATCH PROCESSOR
 *******************************************************/
function buildCuvBibleBatch() {

  const scriptProps = PropertiesService.getScriptProperties();
  let batchIndex = parseInt(scriptProps.getProperty("bibleBatchIndex") || "0");

  const totalBooks = ChineseBibleBookOrder.length;
  const totalBatches = Math.ceil(totalBooks / BATCH_SIZE);

  const start = batchIndex * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, totalBooks);

  if (start >= totalBooks) {
    logMessage(`${getCallStackTrace()}: All books completed.`);
    stopBibleTrigger();
    return;
  }

  Logger.log(`Running batch ${batchIndex + 1} of ${totalBatches}`);
  Logger.log(`Processing books index ${start} to ${end - 1}`);

  try {

    // Load existing JSON
    let bible = loadExistingBibleJson();

    for (let i = start; i < end; i++) {

      const originalBookName = ChineseBibleBookOrder[i];
      const cleanBookName = removeEnglishFromBookName(originalBookName);
      const chapterLengths = ChineseBibleEachChapterLength[originalBookName];

      if (!bible[cleanBookName]) {
        bible[cleanBookName] = {};
      }

      for (let c = 0; c < chapterLengths.length; c++) {

        const chapterNumber = (c + 1).toString();

        if (!bible[cleanBookName][chapterNumber]) {
          bible[cleanBookName][chapterNumber] = {};
        }

        const verseCount = chapterLengths[c];

        for (let v = 1; v <= verseCount; v++) {

          const verseNumber = v.toString();

          const rawText = bibleGatewaySingleVerseCapture(
            cleanBookName,
            chapterNumber,
            v
          );

          const cleanText = stripLeadingVerseNumber(rawText);

          bible[cleanBookName][chapterNumber][verseNumber] = cleanText;
        }
      }
    }

    // Only save if EVERYTHING above succeeded
    saveBibleJson(bible);

    // ✅ Only increment if no error
    scriptProps.setProperty("bibleBatchIndex", (batchIndex + 1).toString());

    Logger.log(`Batch ${batchIndex + 1} finished.`);

    if (batchIndex + 1 >= totalBatches) {
      logMessage(`${getCallStackTrace()}: All batches complete.`);
      stopBibleTrigger();
    }

  } catch (error) {

    logMessage(`${getCallStackTrace()}: Batch failed. Will retry same batch next run.`);
    logMessageError(`${getCallStackTrace()}: Error message = ${error}`);

    // DO NOT increment batch index
    // DO NOT stop trigger
    // Next trigger run will retry same batch
  }
}


/*******************************************************
 * REMOVE ENGLISH FROM BOOK NAME
 *******************************************************/
function removeEnglishFromBookName(book) {
  return book.replace(/\s*\(.*?\)/g, '').trim();
}


/*******************************************************
 * LOAD EXISTING JSON FROM DRIVE
 *******************************************************/
function loadExistingBibleJson() {

  const files = DriveApp.getFilesByName(OUTPUT_FILE_NAME);

  if (files.hasNext()) {
    const file = files.next();
    const content = file.getBlob().getDataAsString();
    return JSON.parse(content);
  }

  return {}; // simple root structure
}


/*******************************************************
 * SAVE JSON TO DRIVE (PRETTY FORMAT)
 *******************************************************/
function saveBibleJson(bible) {

  const jsonString = JSON.stringify(bible, null, 2);

  const files = DriveApp.getFilesByName(OUTPUT_FILE_NAME);

  if (files.hasNext()) {
    const file = files.next();
    file.setContent(jsonString);
  } else {
    DriveApp.createFile(OUTPUT_FILE_NAME, jsonString, MimeType.PLAIN_TEXT);
  }
}


/*******************************************************
 * CREATE TRIGGER (30 minutes)
 *******************************************************/
function startBibleTrigger() {

  resetBibleBuild() //start fresh
  ScriptApp.newTrigger("buildCuvBibleBatch")
    .timeBased()
    .everyMinutes(30)
    .create();

  logMessage(`${getCallStackTrace()}: 30-minute trigger created.`);
}


/*******************************************************
 * STOP TRIGGER
 *******************************************************/
function stopBibleTrigger() {

  const triggers = ScriptApp.getProjectTriggers();

  for (let trigger of triggers) {
    if (trigger.getHandlerFunction() === "buildCuvBibleBatch") {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  logMessage(`${getCallStackTrace()}: Bible trigger stopped.`);
}

function stripLeadingVerseNumber(text) {
  if (typeof text !== "string") {
    return text;
  }
  return text.replace(/^\s*\d+\s*/, '').trim();
}

/*******************************************************
 * RESET SYSTEM
 *******************************************************/
function resetBibleBuild() {

  PropertiesService.getScriptProperties()
    .deleteProperty("bibleBatchIndex");

  logMessage(`${getCallStackTrace()}: Batch index reset.`);
}