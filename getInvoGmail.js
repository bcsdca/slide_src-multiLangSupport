function getInvoGmail(isTesting) {
  try {
    // Extract email content newer_than:2d
    const { worshipQuery, cantQuery } = getQueries(isTesting); // pass false for normal
    logMessage(`${getCallStackTrace()}: cantQuery = ${cantQuery}, with isTesting = ${isTesting} `);
    const cantThreads = GmailApp.search(cantQuery);
    
    // Check if any threads are found
    if (cantThreads.length === 0) {
      logMessage(`${getCallStackTrace()}: No Cantonese worship reminder email thread found.`);
      return null;  // Return null when no threads are found
    }
    
    // Get the latest thread
    const latestThread = cantThreads.reduce((latest, thread) =>
      thread.getLastMessageDate() > latest.getLastMessageDate() ? thread : latest
    );

    const latestSubject = latestThread.getFirstMessageSubject();  
    logMessage(getCallStackTrace() + `: The Cantonese worship reminder email subject found is "${latestSubject}"`); 
    
    const messages = latestThread.getMessages();
    const messageLength = messages.length;
    
    var cantEmailContent = "";

    // Combine all messages into one (without extra newlines)
    for (let j = 0; j < messageLength; j++) {
      cantEmailContent = messages[j].getPlainBody().concat(cantEmailContent);
    }

    logMessage(`${getCallStackTrace()}: Extracted Cantonese worship reminder email content = ${cantEmailContent}`);
    return cantEmailContent;

  } catch (error) {
    logMessage(`${getCallStackTrace()}: Error = ${error}`);
    return null;  // Return null on error
  }
}


