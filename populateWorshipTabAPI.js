//if usingJSONBible is true, it will fetch the passage using the pre-compiled json bible
//if usingJSONBible is false, then it will using the AI provider specified to fetch the bible passage
//AI provider is always use to parse 2 gmails to fetch the invocation, worship and announcement info, this can't be change
//fontProfile (large, medium, small) determine the font size for invocation and scripture reading passage

function populateWorshipTabAPI(provider = "deepseek", language = "chinese", isTesting = false, usingJSONBible = false, fontProfile) {
  clearLogSheet();
  SpreadsheetApp.getActive().toast(
    `Start populating the worship tab with the help from ${provider.toUpperCase()} API, language = ${language}, usingJSONBible = ${usingJSONBible}, isTesting = ${isTesting}... Please wait.`,
    "Processing...", -1
  );

  logMessage(`${getCallStackTrace()}: Start populating the worship tab with the help from ${provider} API, language = ${language}, usingJSONBible = "${usingJSONBible}, isTesting = ${isTesting}`);

  const comingSundayStr = getComingSunday();

  if (typeof isTesting !== "boolean") {
    isTesting = false;
    logMessage(`${getCallStackTrace()}: Called by time trigger, forcing isTesting = false`);
  }

  const today = new Date();
  const comingSundayOffset = 7 - today.getDay();
  const comingSunday = Utilities.formatDate(
    new Date(today.setDate(today.getDate() + comingSundayOffset)),
    Session.getScriptTimeZone(),
    "MM/dd/yyyy"
  );

  logMessage(`${getCallStackTrace()}: This coming Sunday is ${comingSunday}`);

  // 🔄 Unified function calls
  const worshipInfo = getWorshipInfoAPI(isTesting, provider);
  const invocationPassages = getInvoInfoAPI(isTesting, provider);

  // Check results
  if ((!worshipInfo || !worshipInfo.attachment || !worshipInfo.scriptureReading || !worshipInfo.sermon ||
    !worshipInfo.speaker || !worshipInfo.annoArray || worshipInfo.annoArray.length === 0)) {
    if (isTesting) {
      logMessage(`${getCallStackTrace()}: Missing worship info, exiting (testing mode).`);
    } else {
      handleMissingInfo(provider);
    }
    safeExit();
    return;
  }

  logMessage(`${getCallStackTrace()}: Worship info: ${JSON.stringify(worshipInfo, null, 2)}`);

  if (!invocationPassages || !Array.isArray(invocationPassages) || invocationPassages.length === 0) {
    if (isTesting) {
      logMessage(`${getCallStackTrace()}: Missing invocation info, exiting (testing mode).`);
    } else {
      handleMissingInfo(provider);
    }
    safeExit();
    return;
  }

  logMessage(`${getCallStackTrace()}: Invocation passages: ${JSON.stringify(invocationPassages, null, 2)}`);

  // Sheet setup
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("worship");
  if (!sheet) {
    logMessageError(`${getCallStackTrace()}: 'worship' sheet not found!`);
    safeExit();
    return;
  }

  let sheetContents = sheet.getDataRange().getValues();
  let lastRow = sheetContents.length;
  const titleRows = findTitleRows(sheetContents);

  cleanupOldData(sheet, titleRows, lastRow);
  sheetContents = sheet.getDataRange().getValues();
  lastRow = sheetContents.length;

  // Process Invocation
  var invoRowToInsert = findInvocationInsertRow(sheetContents);

  try {
    invocationPassages.forEach((passage) => {
      const used = extractMultiLanguagePassage(passage, sheet, invoRowToInsert, language, provider, usingJSONBible, fontProfile);
      invoRowToInsert += used;

    });
  } catch (err) {
    logMessageError(`${getCallStackTrace()}: Error in calling extractMultiLanguagePassage function: ` + err);
    safeExit();
    //dont return if there is invocation problem
    //return;
  }

  try {
    // Process Scripture Reading
    let srRowToInsert = findScriptureReadingRow();
    processWorshipEmailAPI(provider, srRowToInsert, sheet, worshipInfo, language, usingJSONBible, fontProfile);
  } catch (err) {
    logMessageError(`${getCallStackTrace()}: Error in calling processWorshipEmailAPI function: ` + err);
    safeExit();
    return;
  }

  try {
    // Process Announcements
    processAnnouncementsAPI(provider, worshipInfo.attachment, worshipInfo.annoArray);
  } catch (err) {
    logMessageError(`${getCallStackTrace()}: Error in calling processAnnouncementsAPI function: ` + err);
    safeExit();
    return;
  }

  flushLogsToSheet();

  // ✅ Run createWorshipSlide ONLY if everything above succeeded
  createWorshipSlideAndSendEmail(comingSundayStr,fontProfile)

  //remove all triggers
  toggleTrigger("disable", provider)

  logMessage(`${getCallStackTrace()}: Done populating worship info using ${provider.toUpperCase()} API!`);

  SpreadsheetApp.getActive().toast(`Done populating worship info using ${provider.toUpperCase()} API!`, "👍");
  flushLogsToSheet();

}

function getPPTAssigneeInfo(comingSundayStr) {
  const ss = SpreadsheetApp.openById(weeklyShare);
  const sheet = ss.getSheetByName("handoff");

  if (!sheet) {
    logMessage(`${getCallStackTrace()}: Sheet "handoff" not found in spreadsheet ${weeklyShare}`);
    throw new Error(`Sheet "handoff" not found in spreadsheet ${weeklyShare}`);
  }

  const data = sheet.getDataRange().getValues();

  const normalize = d =>
    Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), "MM/dd/yyyy");

  for (let i = 1; i < data.length; i++) {
    const rowDate = normalize(data[i][0]);

    if (rowDate === comingSundayStr) {
      const name = data[i][1];   // Column B
      const email = data[i][2];  // Column C

      if (!name || !email) {
        logMessage(`${getCallStackTrace()}: Missing name/email for ${comingSundayStr} at row ${i + 1}`);
        throw new Error(`Missing name/email for ${comingSundayStr} at row ${i + 1}`);
      }

      logMessage(`${getCallStackTrace()}: Found assignee ${name} (${email})`);
      return { name, email };
    }
  }
  logMessage(`${getCallStackTrace()}: No row found for date: ${comingSundayStr}`);
  throw new Error(`No row found for date: ${comingSundayStr}`);
}

function createWorshipSlideAndSendEmail(comingSundayStr,fontProfile) {

  try {
    logMessage(`${getCallStackTrace()}: Calling createWorshipSlide...`);
    const worshipSlideMaster = getWorshipSlideMaster();
    const result = createWorshipSlide(fontProfile);
    clearLogSheet();
    if (result) {

      try {
        //const { name, email } = getPPTAssigneeInfo(comingSundayStr);
        name = "xxx";
        email = "shui.bill.chu@gmail.com";

        GmailApp.sendEmail(
          email, // TO: assignee
          "Worship PPT Preparation Simplified for " + comingSundayStr,
          "", // plain text fallback
          {
            //cc: "shui.bill.chu@gmail.com,andylucychu@gmail.com", // 👈 copy bill and andy
            htmlBody: `
            <p>Dear ${name},</p>

            <p>We’ve simplified the worship slide preparation process a bit further.</p>
            <p>
            When you click the link below, it will download this week's worship slide with the .pptx format to your computer's download folder.
            <p>
            <b>Download this weekly worship PPTX file here:</b><br>
            <a href="${result.pptUrl}">${result.pptUrl}</a>
            </p>
            </p> This link is automatically sent to you once the slides are created.
            </p> 
            <p>You can then just copy and paste(use destination theme) the content into this cec worship slide master template below:
            <br>
            <a href="${worshipSlideMaster.download}">
            <b>Download ${worshipSlideMaster.name}</b>
            </a>            
            <p>
            This means you no longer need to log in to the cantoneseworship account initially.
            However, you will still need to log in later to upload the final slides.
            </p>
            <p>If you have any questions, feel free to reach out.</p>

            <p>Blessing!</p>
            <p>Cantonese Worship Team</p>
      `
          }
        );

        logMessage(`${getCallStackTrace()}: Email sent to ${name} (${email}), CC to self`);

      } catch (err) {
        logMessageError(`${getCallStackTrace()}: Failed to send personalized email: ` + err);

        // Optional fallback: send to yourself only
        GmailApp.sendEmail(
          "shui.bill.chu@gmail.com",
          "Fallback: PPTX Ready for " + comingSundayStr,
          `Could not find assignee. Error:\n${err}\n\nLink:\n${result.pptUrl}`
        );
        safeExit();
        return;
      }

    } else {
      logMessage(`${getCallStackTrace()}: Skipping email because slide URL is empty.`);
    }
  } catch (err) {
    logMessageError(`${getCallStackTrace()}: Error in createWorshipSlide/sendEmail: ` + err);
    safeExit();
    return;
  }
}

function getWorshipSlideMaster() {
  const file = DriveApp.getFileById(worshipSlideMasterId);

  return {
    name: file.getName(),
    download: `https://drive.google.com/uc?export=download&id=${worshipSlideMasterId}`,
    view: `https://drive.google.com/file/d/${worshipSlideMasterId}/view`
  };
}

function safeExit() {
  //logMessage(message);
  flushLogsToSheet();
  SpreadsheetApp.getActive().toast("Error Stopped ⚠️", 5);
}

//using API or json bible to get the scripture reading passages
function processScriptureReadingAPI(provider, scriptureReading, srRowToInsert, sheet, language, usingJSONBible, fontProfile) {
  logMessage(`${getCallStackTrace()}: [${provider.toUpperCase()}] scriptureReading line from email = ${scriptureReading}`);

  // Extract the passage portion after "Reading"
  const match = scriptureReading.match(/\s+Reading\s+(.*)/i);
  const scriptureReadingPassage = match ? match[1].trim() : "";

  if (!scriptureReadingPassage) {
    logMessageError(`${getCallStackTrace()}: ⚠️ Could not extract a valid passage from "${scriptureReading}"`);
    return "";
  }

  // 🔄 Unified call — dynamically switch depending on provider
  const scriptureReadingPassageRowsUsed = extractMultiLanguagePassage(
    scriptureReadingPassage,
    sheet,
    srRowToInsert,
    language,
    provider,
    usingJSONBible,
    fontProfile
  );

  logMessage(
    `${getCallStackTrace()}: [${provider.toUpperCase()}] scriptureReadingPassageRowsUsed = ${scriptureReadingPassageRowsUsed}, for inserting passage "${scriptureReadingPassage}"`
  );

  return scriptureReadingPassage;
}


function sermonSpeakerToSS(sermonTitle, scriptureReadingTitle, speakerName) {
  var sheet = SpreadsheetApp.getActive().getSheetByName("worship");
  var dataRange = sheet.getDataRange();
  var sheetContents = dataRange.getValues();

  for (var i = 0; i < sheetContents.length; i++) {
    if (sheetContents[i].toString().includes("TITLE_SERMON_TOPIC")) {
      var row = i + 1;
      var data = [sermonTitle + "\n" + scriptureReadingTitle, speakerName, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd-HH:mm:ss')];
      sheet.insertRowAfter(row);
      sheet.getRange(row + 1, 1, 1, 3).setBackground('white').setFontColor("black").setValues([data]);
      break;
    }
  }
}


function saveAnnouncementsToSS(announcementMessages) {
  var sheet = SpreadsheetApp.getActive().getSheetByName("worship");
  var sheetContents = sheet.getDataRange().getValues();

  var announcementRowIndex = findRowIndex(sheetContents, /TITLE_ANNOUNCEMENT/);
  if (announcementRowIndex === -1) {
    logMessageError(`${getCallStackTrace()}: TITLE_ANNOUNCEMENT not found in the sheet.`);
    return;
  }

  logMessage(`${getCallStackTrace()}: Found TITLE_ANNOUNCEMENT at row: ${announcementRowIndex + 1}`);
  var currentRow = announcementRowIndex + 1;

  for (var i = 0; i < announcementMessages.length; i++) {
    //since announcementMessages array start with index 0, so 1st element is pointing to 1st announcement to work on
    logMessage(`${getCallStackTrace()}: Working on this announcement = ${JSON.stringify(announcementMessages[i])}`);

    var parsedAnnouncement = parseAnnouncementMessage(announcementMessages[i]);
    logMessage(`${getCallStackTrace()}: Parsed announcement : ${JSON.stringify(parsedAnnouncement)}`);

    // Save each part of the announcement to the spreadsheet
    saveAnnouncementToSS(sheet, currentRow, parsedAnnouncement);
    currentRow += parsedAnnouncement.pages.length;

  }
}


function parseAnnouncementMessage(message) {
  let [title, ...bodyParts] = message.split(/(:|：|！|!)/);
  title += bodyParts.shift(); // Append the separator back to the title
  let body = bodyParts.join("").trim();

  // Split body into pages based on a maximum character limit
  //let pages = splitByPeriodEtc(body, max_c_per_anno_page);
  //using the improved splitByPeriodEtc version as below
  let pages = splitAnnouncementIntoSlides(body)

  return { title: title.trim(), pages: pages };
}

function saveAnnouncementToSS(sheet, row, announcement) {
  announcement.pages.forEach((page, index) => {
    let pageTitle = index === 0 ? announcement.title : announcement.title + " (續)";
    let data = [pageTitle, page, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd-HH:mm:ss')];

    logMessage(`${getCallStackTrace()}: Saving announcement page to sheet: ${data}`);
    sheet.insertRowAfter(row);
    sheet.getRange(row + 1, 1, 1, 3).setBackground('white').setFontColor('black').setValues([data]);
    row++;
  });
}

function findRowIndex(contents, regex) {
  for (var i = 0; i < contents.length; i++) {
    if (contents[i].toString().match(regex)) {
      return i;
    }
  }
  return -1;
}


function splitByPeriodEtc(p, c) {
  const temp1_array = [];
  const split_char = "";
  const passage_in = [];

  // Split the input passage by specific punctuation marks and include the delimiters
  const a = p.split(/([。]|[，]|[,]|[、]|[?]|[；])/);

  // Combine text chunks with their delimiters
  for (let i = 0; i < a.length; i += 2) {
    passage_in.push(a[i + 1] !== undefined ? a[i] + a[i + 1] : a[i]);
  }

  let rt_c_per_page = 0;
  let temp_array = [];

  // Loop through the passage chunks and accumulate them into pages
  for (let i = 0; i < passage_in.length; i++) {
    if (passage_in[i].length === 0) continue;

    const asciiCount = countAsciiCharacters(passage_in[i]);
    //const effectiveCharCount = passage_in[i].length - asciiCount + (asciiCount * 3) / 4;
    //change it to 5/8 when 1/3 of chars are ascii
    const effectiveCharCount = passage_in[i].length - asciiCount + (asciiCount * 5) / 8;
    rt_c_per_page += effectiveCharCount;

    logMessage(`${getCallStackTrace()}: This announement chunk ${i}'s length = ${passage_in[i].length}, with ascii char = ${asciiCount}, and the effective char = ${effectiveCharCount}, with the content of \"${passage_in[i]}\"`);

    if (rt_c_per_page <= c) {
      //if the running total chars per page is less than or equal to max char allowed per page, then we fit it in the current page
      temp_array.push(passage_in[i]);
      logMessage(`${getCallStackTrace()}: Putting this announement chunk ${i}, to the temp array: ${JSON.stringify(temp_array)}, with the running total chars of ${rt_c_per_page}`);
    } else {
      //this is starting of a new page, after finishing up the last page
      logMessage(`${getCallStackTrace()}: If we putting this announement chunk ${i}, to the temp array: ${JSON.stringify(temp_array)}, with the running total chars of ${rt_c_per_page}`);
      logMessage(`${getCallStackTrace()}: This will be exceeding the max chars for this page = ${c}, if we add this chunk ${i}`);
      logMessage(`${getCallStackTrace()}: So, this is the announcment for this page = ${temp_array.join(split_char)}, Number of chars for this page is ${(rt_c_per_page - effectiveCharCount)}`);

      temp1_array.push(temp_array.join(split_char));

      // Start a new page
      rt_c_per_page = effectiveCharCount;
      temp_array = [passage_in[i].trim()];
      logMessage(`${getCallStackTrace()}: Starting a new page!!! Putting this chunk ${i}, to the array: ${temp_array}, with the running total chars of ${rt_c_per_page}`);
    }
  }

  // Add the last page
  if (temp_array.length > 0) {
    temp1_array.push(temp_array.join(split_char));
  }
  logMessage(`${getCallStackTrace()}: This are announcment pages return, after splitting all up by the special chars and gather up by the chunks ${JSON.stringify(temp1_array)}`);
  return temp1_array;
}

function findInvocationInsertRow(sheetContents) {
  for (let i = 0; i < sheetContents.length; i++) {
    if (sheetContents[i].toString().includes("TITLE_INVOCATION")) {
      return i + 1;
    }
  }
  return sheetContents.length + 1; // Default to the end of the sheet if not found
}


function saveInvocationPassages(array_invo_passage, invo_row_to_insert) {
  let total_rows_used = 0;

  for (let k = 0; k < array_invo_passage.length; k++) {
    const passage = array_invo_passage[k];
    logMessage(`${getCallStackTrace()}: Invocation Bible passage is ${passage}`);

    const invo_passage_array = passageCapture(passage);
    logMessage(`${getCallStackTrace()}: Invocation passage array returning from the reading subroutine is ${invo_passage_array}, for the passage ${passage}`);

    const rows_used = passageToSS(passage, invo_passage_array, invo_row_to_insert + total_rows_used, "worship");
    total_rows_used += rows_used;
  }

  return invo_row_to_insert + total_rows_used;
}

// Function to delete rows between two titles
function deleteRowsBetween(sheet, startRow, endRow, isLastTitle) {
  var rowsToDelete = endRow - startRow - 1;
  //there is one extra row to delete if it is TITLE_ANNOUNCEMENT
  if (isLastTitle) {
    rowsToDelete = endRow - startRow
  }

  for (let i = 0; i < rowsToDelete; i++) {
    sheet.deleteRow(startRow + 1);
    logMessage(`${getCallStackTrace()}: Deleting row ${startRow + 1}, Starting from row ${startRow} To row ${endRow}`);
  }
}

// Utility Functions
function findTitleRows(sheetContents) {
  let titles = {
    "TITLE_INVOCATION": 0,
    "TITLE_SCRIPTURE_READING": 0,
    "TITLE_SERMON_TOPIC": 0,
    "TITLE_ANNOUNCEMENT": 0
  };

  sheetContents.forEach((row, i) => {
    const rowString = row.toString();
    Object.keys(titles).forEach(title => {
      if (rowString.includes(title)) {
        titles[title] = i + 1;
      }
    });
  });

  return titles;
}

function cleanupOldData(sheet, titleRows, lastRow) {
  deleteRowsBetween(sheet, titleRows.TITLE_ANNOUNCEMENT, lastRow, true);
  deleteRowsBetween(sheet, titleRows.TITLE_SERMON_TOPIC, titleRows.TITLE_ANNOUNCEMENT, false);
  deleteRowsBetween(sheet, titleRows.TITLE_SCRIPTURE_READING, titleRows.TITLE_SERMON_TOPIC, false);
  deleteRowsBetween(sheet, titleRows.TITLE_INVOCATION, titleRows.TITLE_SCRIPTURE_READING, false);
}


function findScriptureReadingRow() {
  dataRange = SpreadsheetApp.getActive().getSheetByName("worship").getDataRange();
  sheetContents = dataRange.getValues();
  for (let i = 0; i < sheetContents.length; i++) {
    if (sheetContents[i].toString().includes("TITLE_SCRIPTURE_READING")) {
      logMessage(`${getCallStackTrace()}: Found \"TITLE_SCRIPTURE_READING\" at row ${i + 1}`);
      return i + 1;
    }
  }
  return 0;
}

function processWorshipEmailAPI(provider, srRowToInsert, sheet, worshipInfo, language, usingJSONBible, fontProfile) {

  let scriptureReadingTitle = "", sermonTitle = "", speakerName = "";

  scriptureReadingTitle = processScriptureReadingAPI(provider, worshipInfo.scriptureReading, srRowToInsert, sheet, language, usingJSONBible, fontProfile);
  let sermonLine = worshipInfo.sermon.replace("Sermon:", "Sermon").trim();
  logMessage(`${getCallStackTrace()}: sermonLine: ${sermonLine}`);
  sermonTitle = parseSermonTopic(sermonLine);

  speakerName = worshipInfo.speaker.replace("Speaker:", "Speaker").split('Speaker')[1].trim();
  sermonSpeakerToSS(sermonTitle, scriptureReadingTitle, speakerName);

}

function processAnnouncementsAPI(provider, attachment, annoArray) {
  //announcementMessages is just the messages needed to go to the ppt, whatever is in the annoArray
  let announcementMessages = extractAnnouncementsAPI(attachment, annoArray, provider);

  logMessage(`${getCallStackTrace()}: Extracted announcements using ${provider}: ${JSON.stringify(announcementMessages)}`);
  saveAnnouncementsToSS(announcementMessages);
}

function handleMissingInfo(provider) {
  SpreadsheetApp.getActive().toast("Missing one or both emails!", "👎");
  logMessageError(`${getCallStackTrace()}: Missing one or both emails!`);

  let today = new Date();
  let dayOfWeek = today.getDay();

  if (dayOfWeek !== 0) {
    logMessage(`${getCallStackTrace()}: Today is ${dayOfWeek}. Will keep looking for emails/info.`);
    toggleTrigger("enable", provider)
  } else {
    logMessage(`${getCallStackTrace()}: Today is Sunday, stopping search for emails.`);
    toggleTrigger("disable", provider)
  }
  flushLogsToSheet();
}
