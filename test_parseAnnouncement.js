function test_parseAnnouncement() {
  //Emily's worship info email C-07/18/25
  //var threads = GmailApp.search('worship info C-3/5/2023', 0, 1);
  var threads = GmailApp.search('worship info C-2/12/2023', 0, 1);
  //var threads = GmailApp.search('worship info C-1/15/2023', 0, 1);
  //var threads = GmailApp.search('worship info C-1/8/2023', 0, 1);
  //var threads = GmailApp.search('worship info C-1/1/2023', 0, 1);
  //var threads = GmailApp.search('worship info C-12/18/2022', 0, 1);
  //var threads = GmailApp.search('worship info C-12/11/2022', 0, 1);
  //var threads = GmailApp.search('worship info C-11/27/2022', 0, 1);
  //var threads = GmailApp.search('worship info C-10/23/2022', 0, 1);
  //var threads = GmailApp.search('worship info C-8/7/2022', 0, 1);
  //var threads = GmailApp.search('worship info C-7/24/2022', 0, 1);
  //var threads = GmailApp.search(query, 0, 1);
  //the 1st message from the thread0 is what Emily send out 1st and needed to be parse
  var message = threads[0].getMessages()[0];

  var attachment = message.getAttachments()[0];
  console.log("Emily's email attachment file name is " + attachment.getName())

  var pdfFile = attachment.getName();
  console.log("pdfFile name to be parse is " + pdfFile)
  var blob = attachment.copyBlob();

  // Get the text from pdf
  var filetext = pdfToText(blob, { keepTextfile: false });
  console.log("Emily's email attach PDF messages is " + filetext)
  
  //looking for announcements only after "cprograms" in pdf file
  var tmp_pdf = filetext.split("cprograms");
  console.log("All temporary announcements are %s",tmp_pdf[1])
  //then splitting it based on the announcment #
  var msg_pdf = tmp_pdf[1].split(/\d+\./);
  
  for (var i = 1; i < msg_pdf.length; i++) {
    //last announcement getting rid of the rest of stuff using split by "\n"
    if (i == (msg_pdf.length - 1)) {
      var ar_temp_msg_pdf = msg_pdf[i].split("\n")
      msg_pdf[i] = ar_temp_msg_pdf[0]
      //console.log("last announcement %d: %s", i, ar_temp_msg_pdf[0])
    }
    msg_pdf[i] = i + "." + msg_pdf[i].replace(/\n/g, "")
    //msg_pdf[i] = i + "." + msg_pdf[i]
    console.log("announcement %d: %s", i, msg_pdf[i])
  }
  
}
