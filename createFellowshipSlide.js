function createFellowshipSlide() {

  clearLogSheet();
  SpreadsheetApp.getActive().toast("Start creating the fellowship slides... Please wait.", "Processing...", -1); // Show a persistent toast
  const fellowshipDstId = fileDuplicate(fellowshipSrcId); // Duplicate source deck
  const deck = SlidesApp.openById(fellowshipDstId);

  // Load data from the spreadsheet
  const sheet = SpreadsheetApp.getActive().getSheetByName("fellowship");
  const dataRange = sheet.getDataRange();
  const sheetContents = dataRange.getValues();

  // Arrays to store content for each type of slide
  const songContents = [];
  const fellowshipContents = [];
  const messageContents = [];

  let title = "";

  // Categorize data based on title
  sheetContents.forEach(row => {
    const cellValue = row.toString().trim();

    if (/TITLE/.test(cellValue)) {
      title = cellValue;
      logMessage(arguments.callee.name + `: Title found: ${title}`);
    } else if (/TITLE_FELLOWSHIP/.test(title)) {
      fellowshipContents.push(row);
    } else if (/TITLE_SONG/.test(title)) {
      songContents.push(row);
    } else if (/TITLE_MESSAGE/.test(title)) {
      messageContents.push(row);
    }
  });

  // Helper function to handle slide creation
  function processSlides(contents, titleText, replaceData) {
    const masterSlide = findTitleSlide(deck, titleText);

    if (!masterSlide) {
      logMessage(arguments.callee.name + `: Master slide not found for ${titleText}`);
      return;
    }

    contents.reverse().forEach(row => {
      const slide = masterSlide.duplicate();
      replaceData(slide, row);
    });

    masterSlide.remove(); // Remove master slide after processing
    logMessage(arguments.callee.name + `: Done processing slides for ${titleText}`);
  }

  // Define slide data replacement functions
  function replaceFellowshipSlide(slide, row) {
    slide.replaceAllText("TITLE_FELLOWSHIP", row[0]);
    const formattedDate = Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'E MM/dd/yyyy');
    //const formattedDate = Utilities.formatDate(row[1], "GMT+0", 'E MM/dd/yyyy');
    slide.replaceAllText("TITLE_DATE", formattedDate);
  }

  function replaceSongSlide(slide, row) {
    slide.replaceAllText("TITLE_SONG", row[0]);
    slide.replaceAllText("TITLE_AUTHOR", row[1]);

    if (row[2]) {
      try {
        slide.insertVideo(row[2]);
      } catch (e) {
        logMessage(arguments.callee.name + `: Error inserting video: ${e.message}`);
      }
    }
  }

  function replaceMessageSlide(slide, row) {
    slide.replaceAllText("TITLE_MESSAGE", row[0]);
    slide.replaceAllText("MESSAGE_BODY", row[1]);
  }

  // Process slides
  processSlides(fellowshipContents, "TITLE_FELLOWSHIP", replaceFellowshipSlide);
  processSlides(songContents, "TITLE_SONG", replaceSongSlide);
  processSlides(messageContents, "TITLE_MESSAGE", replaceMessageSlide);

  deck.saveAndClose();
  flushLogsToSheet()
  logMessage(arguments.callee.name + `: Completed all slide processing.`);
  SpreadsheetApp.getActive().toast("Done creating fellowship slides!", "👍");
}

