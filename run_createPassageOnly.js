function run_createPassageOnly(p) {
  try {
    clearLogSheet();
    const { book, from_chapter, from_verse, to_chapter, to_verse } = p;

    // Log the selected passage
    logMessage(getCallStackTrace() + `: Selected passage: ${book} ${from_chapter}:${from_verse} to ${book} ${to_chapter}:${to_verse}`);
    
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
    createPassageOnly(passage);
   
    // Return success message
    return "Done, We have finished creating the Google Slides for the scripture passage " + passage + ", Please select the \"Share with me\" label of your Google Drive, and you should be able to see your google slide there 🎉 !!!";

  } catch (error) {
    // Log the error for debugging
    logMessageError(getCallStackTrace() + "Error in run_createPassagePPT: ", error);
    return "An error occurred while creating the Google Slides for the scripture passage.";
  
  } finally {
    flushLogsToSheet(); // always runs
  }
}
