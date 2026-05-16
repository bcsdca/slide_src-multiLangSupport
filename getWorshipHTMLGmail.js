function getWorshipHTMLGmail(isTesting) {
  var worshipGmailInfo = {
    success: false  // Default to false
  };

  try {
    const { worshipQuery, cantQuery } = getQueries(isTesting); // pass false for normal
    logMessage(`${getCallStackTrace()}: worshipQuery = ${worshipQuery}, with isTesting = ${isTesting} `);
    const threads = GmailApp.search(worshipQuery);
    logMessage(`${getCallStackTrace()}: Total # of threads = ${threads.length}`);

    if (threads.length === 0) {
      logMessage(`${getCallStackTrace()}: No threads found.`);
      return worshipGmailInfo;  // Return with success: false
    }

    var message_length = threads[0].getMessages().length;
    var messageHTML = "";

    // Combine all messages in HTML format into one
    for (var j = 0; j < message_length; j++) {
      messageHTML = threads[0].getMessages()[j].getBody().concat(messageHTML);
    }

    // Find PDF attachment
    var attachment = null;

    for (var i = 0; i < message_length; i++) {
      var msg = threads[0].getMessages()[i];
      var attachments = msg.getAttachments();

      for (var k = 0; k < attachments.length; k++) {
        if (attachments[k].getContentType().match("pdf")) {
          attachment = attachments[k];
          logMessage(`${getCallStackTrace()}: Found PDF: ${attachment.getName()}`);
          break;  // Stop after finding the first PDF
        }
      }

      if (attachment) break;  // Exit outer loop if PDF is found
    }

    if (!attachment) {
      logMessage(`${getCallStackTrace()}: No PDF attachment found.`);
      return worshipGmailInfo;  // Return with success: false
    }

    logMessage(getCallStackTrace()
      + `: Emily's email subject is \"${threads[0].getMessages()[0].getSubject()}\", and the thread0's whole message length is ${message_length}, and the attachment file name is \"${attachment.getName()}\"`);

    // Store the results
    worshipGmailInfo.message = messageHTML;
    worshipGmailInfo.attachment = attachment;
    if (worshipGmailInfo.attachment) {
      logMessage(`${getCallStackTrace()}: REAL ATTACHMENT INFO - 
        Name: ${worshipGmailInfo.attachment.getName()}
        Size: ${worshipGmailInfo.attachment.getSize()} bytes
        Type: ${worshipGmailInfo.attachment.getContentType()}`);
    }
    worshipGmailInfo.success = true;  // Mark as successful

    //the statement below might caused this messages "Your input contains more than the maximum of 50000 characters in a single cell.""
    //logMessage(`${getCallStackTrace()}: Worship email's content in HTML format = ${messageHTML}`);

  } catch (err) {
    logMessageError(`${getCallStackTrace()}: Error - ${err}`);
    worshipGmailInfo.success = false;  // Ensure failure on error
  }
  //the statement below might caused this messages "Your input contains more than the maximum of 50000 characters in a single cell.""
  //logMessage(`${getCallStackTrace()}: worshipGmailInfo = ${JSON.stringify(worshipGmailInfo, null, 2)}`);
  return worshipGmailInfo;
}
