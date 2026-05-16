function extractTextFromPDF() {
  // PDF File URL
  // You can also pull PDFs from Google Drive
  //var url = 'https://drive.google.com/drive/my-drive/Cantonese bulletin-021223.pdf';
  var pdfFile = DriveApp.getFilesByName("Cantonese bulletin-021223.pdf").next();
  console.log("pdfFile " +  pdfFile)
  var blob = pdfFile.getBlob();

  //var blob = UrlFetchApp.fetch(url).getBlob();
  var resource = {
    title: blob.getName(),
    mimeType: blob.getContentType(),
  };

  // Enable the Advanced Drive API Service
  //var file = Drive.Files.insert(resource, blob, { ocr: true, ocrLanguage: 'en' });zh-TW
  var file = Drive.Files.insert(resource, blob, { ocr: true, ocrLanguage: 'en' });
  // Extract Text from PDF file
  var doc = DocumentApp.openById(file.id);
  var text = doc.getBody().getText();
  
  
  console.log("pdf text is " + text)

  return text;
}
