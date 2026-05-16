function createPassageSlide(passage, fontProfile = "large") {

  //clearLogSheet();

  const passageSourceMap = {
    large: passageLargeSrcId,
    medium: passageMediumSrcId,
    small: passageSmallSrcId
  };

  const passageSrcId =
    passageSourceMap[fontProfile];

  if (!passageSrcId) {
    throw new Error(
      `Unknown fontProfile: ${fontProfile}`
    );
  }

  logMessage(`
${getCallStackTrace()}: Using font profile "${fontProfile}"
passageSrcId = ${passageSrcId}
`);

  var passage_dstId = fileDuplicate(passageSrcId, passage, fontProfile);

  // Fetch the active user's email
  var email = Session.getActiveUser().getEmail();
  logMessage(getCallStackTrace() + ": Running as user: " + email);

  // do some clean up of the old slides just got created
  //slide_remove_copy(passage_srcid, passage_dstId);

  // Load data from the spreadsheet.
  let dataRange = SpreadsheetApp.getActive().getSheetByName("passage").getDataRange();
  //let dataRange = SpreadsheetApp.getActive().getDataRange();
  let sheetContents = dataRange.getValues();

  // Save the header in a variable called header
  //let header = sheetContents.shift();

  // Create arrays to save the data to be populated for invocation/scripture reading slides.

  let scripture_Contents = [];

  for (var i = 0; (i < sheetContents.length); i++) {
    if (sheetContents[i].toString().match(/TITLE/)) {
      title = sheetContents[i];
      logMessage(getCallStackTrace() + ": ss_title = " + title);
    } else if (title.toString().match(/TITLE_PASSAGE/)) {
      scripture_Contents.push(sheetContents[i]);
      //Logger.log("ss_title = " + title + " ; ss_scripture_Contents = " + scripture_Contents);
    }

  }

  // Reverse the order of rows because new slides will
  // be inserted at the top. Without this, the order of slides
  // will be the inverse of the ordering of rows in the sheet. 

  scripture_Contents.reverse();
  logMessage(getCallStackTrace() + ": scripture_Contents below :");
  dumpArray(scripture_Contents);


  // Working on the scripture reading slides
  const deck = SlidesApp.openById(passage_dstId);
  scripture_masterSlide = findTitleSlide(deck, "TITLE_SCRIPTURE_READING");


  // For every row, create a new slide by duplicating the master slide
  // and replace the template variables with data from that row.
  scripture_Contents.forEach(function (row) {

    // Insert a new slide by duplicating the master slide.
    let slide = scripture_masterSlide.duplicate();

    // Populate data in the slide that was created
    slide.replaceAllText("TITLE_SCRIPTURE_READING", row[0]);
    slide.replaceAllText("SCRIPTURE_READING_PASSAGE", row[1]);

  });

  //Remove the master slide if you no longer need it.
  scripture_masterSlide.remove();
  SlidesApp.openById(passage_dstId).saveAndClose();

  //editors is global variable
  editors.forEach(email => {
    try {
      Drive.Permissions.insert(
        {
          role: "writer",
          type: "user",
          value: email
        },
        passage_dstId,
        {
          sendNotificationEmails: false
        }
      );
      logMessage(getCallStackTrace() + `: Inserted Drive Editor Permission for: ${email}`);
    } catch (e) {
      logMessageError(getCallStackTrace() + `: Error inserting Drive Editor Permission for ${email}: ${e.message}`);
    }

  });

  logMessage(getCallStackTrace() + " : Done with creating the scripture passages slides !!!");

  SpreadsheetApp.getActive().toast("Yea, Done with creating the scripture passages slides !!!", "👍");

}