function test_extractTextWithVisionAPI() {
  const worshipInfo = getWorshipInfoDeepAPI();
  
  logMessage(`${arguments.callee.name}: worshipInfo.scriptureReading return from deep seek API = ${worshipInfo.scriptureReading}`);
  logMessage(`${arguments.callee.name}: worshipInfo.sermon return from deep seek API = ${worshipInfo.sermon}`);
  logMessage(`${arguments.callee.name}: worshipInfo.speaker return from deep seek API = ${worshipInfo.speaker}`);
  logMessage(`${arguments.callee.name}: worshipInfo.annoArray return from deep seek API = ${JSON.stringify(worshipInfo.annoArray)}`);
  logMessage(`${arguments.callee.name}: worshipInfo.attachment return from deep seek API = ${JSON.stringify(worshipInfo.attachment)}`);

  let pdfFile = worshipInfo.attachment.getName();
  logMessage(`${arguments.callee.name}: Parsing PDF file: ${pdfFile}`);
  
  let announcementMessages = extractTextWithVisionAPI1(worshipInfo.attachment);
  logMessage(`${arguments.callee.name}: extracted text from vision API = ${JSON.stringify(announcementMessages)}`);
  
}
