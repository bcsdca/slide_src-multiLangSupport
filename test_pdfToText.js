function test_pdfToText() {
  
  //getting the latest emily's email
  var threads = GmailApp.search('worship info C-', 0, 1);
  var message_length = threads[0].getMessages().length;
  
  var find_pdf = false;
  for (var i = 0; (i < message_length && !find_pdf); i++) {
    var msg = threads[0].getMessages()[i]
    if (msg.getAttachments()[0] != undefined) {
      if (msg.getAttachments()[0].getContentType().match("pdf")) {
        find_pdf = true;
        var attachment = threads[0].getMessages()[i].getAttachments()[0];
      }
    }
  }

  if (find_pdf) {
    console.log(arguments.callee.name
      + ": Emily's email subject is \"%s\", and it's email message length is %d, and the attachment file name is \"%s\"", threads[0].getMessages()[0].getSubject(), message_length, attachment.getName())
  } else {
    console.log(arguments.callee.name + ": Can't find the Cantonese bulletin pdf attachment!!!")

  }
  
  var pdfFile = attachment.getName();
  console.log("pdfFile name to be parse is " + pdfFile)
  var blob = attachment.copyBlob();

  // Get the text from pdf
  var filetext = pdfToText(blob, { keepTextfile: false });

  console.log("After conversion to text file, it looks like this : " + filetext)
}
