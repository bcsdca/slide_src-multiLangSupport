function run_createPassageUsingJSONBible(p, languageChosen, fontProfile) {
  try {
    clearLogSheet();
    const { book, from_chapter, from_verse, to_chapter, to_verse } = p;

    // Log the selected passage
    logMessage(getCallStackTrace() + `: User selected passage on sidebar UI interface: ${book} ${from_chapter}:${from_verse} to ${book} ${to_chapter}:${to_verse}, in ${languageChosen}, and the font profile of "${fontProfile}"`);

    // Fetch the active user's email
    var email = Session.getActiveUser().getEmail();
    logMessage(getCallStackTrace() + ": Running as user: " + email);

    // Construct the passage string based on chapter and verse range
    let passage;
    if (from_chapter == to_chapter) {
      passage = `${book} ${from_chapter}:${from_verse}-${to_verse}`;
    } else {
      passage = `${book} ${from_chapter}:${from_verse}-${to_chapter}:${to_verse}`;
    }

    // Call the createPassagePPT function with the passage
    createPassageUsingJSONBible(passage, languageChosen, fontProfile);

    // Return success message
    return "Done, We have finished creating the Google Slides for the scripture passage " + passage + ", please check the \"Recent\" or the \"Share with me\" label of your Google Drive, and you should be able to see your passage google slide there 🎉 !!!";

  } catch (error) {
    logMessageError(
      getCallStackTrace() + "An error occurred while creating the Google Slides for the scripture passage.\n\n" +
      (error.message || error)
    );

    throw new Error(
      "An error occurred while creating the Google Slides for the scripture passage.\n\n" +
      (error.message || "")
    );
  } finally {
    flushLogsToSheet(); // always runs
  }
}
