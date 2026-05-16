function getGWorshipHTMLGmail(isTesting) {
  var worshipGmailInfo = {
    success: false  // Default to false
  };

  try {
    const { worshipQuery, cantQuery } = getGQueries(isTesting); // pass false for normal
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
        var currentAttachment = attachments[k];
        if (currentAttachment.getContentType().match("pdf") &&
          currentAttachment.getName().toLowerCase().includes("cantonese")) {
          attachment = currentAttachment;
          logMessage(`${getCallStackTrace()}: Found Cantonese PDF: ${attachment.getName()}`);
          break;  // Stop after finding the first matching PDF
        }
      }

      if (attachment) break;  // Exit outer loop if matching PDF is found
    }

    if (!attachment) {
      logMessage(`${getCallStackTrace()}: No PDF attachment found.`);
      return worshipGmailInfo;  // Return with success: false
    }

    logMessage(getCallStackTrace()
      + `: Emily's [CEC Cantonese] [CEC 粵語部] 本週崇拜通報/祈禱表和主日崇拜訊息 email subject is \"${threads[0].getMessages()[0].getSubject()}\", and the thread0's whole message length is ${message_length}, and the attachment file name is \"${attachment.getName()}\"`);

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

    //logMessage(`${getCallStackTrace()}: Worship email's content in HTML format = ${messageHTML}`);

  } catch (err) {
    logMessageError(`${getCallStackTrace()}: Error - ${err}`);
    worshipGmailInfo.success = false;  // Ensure failure on error
  }

  logMessage(`${getCallStackTrace()}: worshipGmailInfo = ${JSON.stringify(worshipGmailInfo, null, 2)}`);
  return worshipGmailInfo;
}
