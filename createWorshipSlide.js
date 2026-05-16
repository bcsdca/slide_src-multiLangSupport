function createWorshipSlide(fontProfile) {

  SpreadsheetApp.getActive().toast("Creating Slides for this Sunday's worship... Please wait.", "Processing...", -1); // Show a persistent toast

  clearLogSheet();

  const worshipSourceMap = {
    large: worshipLargeSrcId,
    medium: worshipMediumSrcId,
    small: worshipSmallSrcId
  };

  const worshipSrcId =
    worshipSourceMap[fontProfile];

  if (!worshipSrcId) {
    throw new Error(
      `Unknown fontProfile: ${fontProfile}`
    );
  }

  logMessage(`
${getCallStackTrace()}: Using font profile "${fontProfile}"
worshipSrcId = ${worshipSrcId}
`);

  const worshipDstId = fileDuplicate(worshipSrcId, undefined, fontProfile);

  const sheet = SpreadsheetApp.getActive().getSheetByName("worship");
  const sheetContents = sheet.getDataRange().getValues();
  const deck = SlidesApp.openById(worshipDstId);

  // Initialize arrays for different slide content types.
  let invoContents = [];
  let scriptureContents = [];
  let sermonTopicContents = [];
  let announcementContents = [];

  for (var i = 0; i < sheetContents.length; i++) {
    logMessage(`${getCallStackTrace()}: sheetContents at row ${i + 1} = ${JSON.stringify(sheetContents[i])}`);

    if (sheetContents[i][0].match(/TITLE/)) {
      title = sheetContents[i][0];
      //logMessage(`${getCallStackTrace()}: ss_title = ${title}`);
    } else if (title.match(/TITLE_INVOCATION/)) {
      invoContents.push(sheetContents[i]);
      //logMessage(`${getCallStackTrace()}: ss_title = ${title} ; ss_invoContents = ${invoContents}`);
    } else if (title.match(/TITLE_SCRIPTURE_READING/)) {
      scriptureContents.push(sheetContents[i]);
      //logMessage(`${getCallStackTrace()}: ss_title = ${title} ; ss_scriptureContents = ${scriptureContents}`);
    } else if (title.match(/TITLE_SERMON_TOPIC/)) {
      sermonTopicContents.push(sheetContents[i]);
      //logMessage(`${getCallStackTrace()}: ss_title = ${title} ; ss_sermonTopicContents = ${sermonTopicContents}`);
    } else if (title.match(/TITLE_ANNOUNCEMENT/)) {
      announcementContents.push(sheetContents[i]);
      //logMessage(`${getCallStackTrace()}: ss_title = ${title} ; ss_announcementContents = ${announcementContents}`);
    }
  }

  // Reverse the order to maintain original sheet order in slides.
  invoContents.reverse();
  scriptureContents.reverse();
  sermonTopicContents.reverse();
  announcementContents.reverse();

  logMessage(`${getCallStackTrace()}: invoContents = ${JSON.stringify(invoContents)}`);
  logMessage(`${getCallStackTrace()}: scriptureContents = ${JSON.stringify(scriptureContents)}`);
  logMessage(`${getCallStackTrace()}: sermonTopicContents = ${JSON.stringify(sermonTopicContents)}`);
  logMessage(`${getCallStackTrace()}: announcementContents = ${JSON.stringify(announcementContents)}`);

  // Create Invocation, Scripture, Sermon Topic, and Announcement slides
  createSlides(deck, invoContents, "TITLE_INVOCATION", [["TITLE_INVOCATION", 0], ["INVOCATION_PASSAGE", 1]]);
  createSlides(deck, scriptureContents, "TITLE_SCRIPTURE_READING", [["TITLE_SCRIPTURE_READING", 0], ["SCRIPTURE_READING_PASSAGE", 1]]);
  createSlides(deck, sermonTopicContents, "TITLE_SERMON_TOPIC", [["TITLE_SERMON_TOPIC", 0], ["SPEAKER", 1]]);
  createSlides(deck, announcementContents, "TITLE_ANNOUNCEMENT", [["TITLE_ANNOUNCEMENT", 0], ["ANNOUNCEMENT_DETAIL", 1]]);

  // Adjust slides based on the week of the month
  //there are 2 "TITLE_LORDS_PRAYER" and 2 "TITLE_APOSTLE_CREED" in the template, that needed to remove
  const comingSundayWeekOfMonth = getComingSundayWeekOfMonth()
  if (comingSundayWeekOfMonth === 1) {
    removeSlides(deck, ["TITLE_LORDS_PRAYER", "TITLE_LORDS_PRAYER", "TITLE_APOSTLE_CREED", "TITLE_APOSTLE_CREED"]);
  } else if (comingSundayWeekOfMonth === 2) {
    removeSlides(deck, ["TITLE_APOSTLE_CREED", "TITLE_APOSTLE_CREED", "TITLE_COMMUNION"]);
  } else if (comingSundayWeekOfMonth === 4) {
    removeSlides(deck, ["TITLE_LORDS_PRAYER", "TITLE_LORDS_PRAYER", "TITLE_COMMUNION"]);
  } else {
    removeSlides(deck, ["TITLE_LORDS_PRAYER", "TITLE_LORDS_PRAYER", "TITLE_APOSTLE_CREED", "TITLE_APOSTLE_CREED", "TITLE_COMMUNION"]);
  }

  deck.saveAndClose();
  logMessage(`${getCallStackTrace()}: Slides for this Sunday's worship have been successfully created.`);

  const slideUrl = `https://docs.google.com/presentation/d/${worshipDstId}`;
  const pptUrl = `https://docs.google.com/presentation/d/${worshipDstId}/export/pptx`;

  logMessage(`${getCallStackTrace()}: Slides created successfully.`);
  logMessage(`${getCallStackTrace()}: PPT download link = ${pptUrl}`);

  //set the google slide to anyone with link can view
  setAnyoneWithLinkCanView(worshipDstId);

  flushLogsToSheet();
  SpreadsheetApp.getActive().toast("Slides for this Sunday's worship have been successfully created.", "Success 👍", "5");
  // return BOTH (recommended)
  return {
    slideUrl: slideUrl,
    pptUrl: pptUrl
  };
}

function createSlides(deck, contents, masterSlideTitle, slideMappings) {
  const masterSlide = findTitleSlide(deck, masterSlideTitle);

  //contents.flat();

  logMessage(`${getCallStackTrace()}: Working on \"${masterSlideTitle}" with contents: ${JSON.stringify(contents)}`);

  contents.forEach((row, rowIndex) => {
    //contents is an 2 dimensional array
    //row is 1 dimensional array
    // Extract the title and scripture text
    const title = row[0];       // 1st element
    const bodyText = row[1];    // 2nd element

    logMessage(`${getCallStackTrace()}: Working on ${masterSlideTitle}, Processing row ${rowIndex}, with title = ${title} and bodyText = ${bodyText}`);
    const slide = masterSlide.duplicate();

    slideMappings.forEach(([placeholder, columnIndex]) => {
      let replacementText;

      // Determine which part to replace based on columnIndex
      if (columnIndex === 0) {
        replacementText = title;
      } else if (columnIndex === 1) {
        replacementText = bodyText;
      } else {
        logMessageError(`${getCallStackTrace()}: Working on ${masterSlideTitle}, Invalid columnIndex "${columnIndex}"`);
        return;
      }

      slide.replaceAllText(placeholder, replacementText);
      logMessage(`${getCallStackTrace()}: Done working on ${masterSlideTitle}, Replacing placeholder "${placeholder}" with "${replacementText}"`);
    });
  });
  masterSlide.remove();
}

// Function to remove specific slides
function removeSlides(deck, titles) {
  titles.forEach(title => {
    const slide = findTitleSlide(deck, title);
    slide.remove();
    logMessage(`${getCallStackTrace()}: Removing this slide = ${title}`);
  });
}