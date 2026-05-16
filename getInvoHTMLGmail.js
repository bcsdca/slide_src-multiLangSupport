function getInvoHTMLGmail(isTesting) {
  try {
    // Extract email content newer_than:2d
    const { worshipQuery, cantQuery } = getQueries(isTesting); // pass false for normal
    logMessage(`${getCallStackTrace()}: cantQuery = ${cantQuery}, with isTesting = ${isTesting} `);
    const cantThreads = GmailApp.search(cantQuery);
    //logMessage(`${getCallStackTrace()}: Total # of threads = ${cantThreads.length} for Cantonese worship reminder email`);
    

    // Check if any threads are found
    if (cantThreads.length === 0) {
      logMessage(`${getCallStackTrace()}: No threads found.`);
      return null;  // Return null when no threads are found
    }

    // Get the latest thread
    const latestThread = cantThreads[0];
    const messages = latestThread.getMessages();
    const messageLength = messages.length;
    logMessage(getCallStackTrace() + `: The Cantonese worship reminder email subject found is ${latestThread.getMessages()[0].getSubject()}", and it's email message length is ${messageLength}`);

    let emailContentHTML = "";

    // Combine all messages in HTML format into one (without extra newlines)
    for (let j = 0; j < messageLength; j++) {
      //emailContent = messages[j].getPlainBody().concat(emailContent);
      //change to getting HTML Body
      emailContentHTML = messages[j].getBody().concat(emailContentHTML);
    }

    //logMessage(`${getCallStackTrace()}: Extracted email content = ${emailContentHTML}`);
    return emailContentHTML;

  } catch (error) {
    logMessage(`${getCallStackTrace()}: Error = ${error}`);
    return null;  // Return null on error
  }
}


