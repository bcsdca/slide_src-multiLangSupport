function fileDuplicate(fileId, passage, fontProfile = "large") {
  try {
    const file = DriveApp.getFileById(fileId);
    //const baseFileName = file.getName().replace("_template", "");
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd-HH:mm:ss');
    if (typeof passage === 'undefined') {
      var newFileName = `worship_${fontProfile}.${timestamp}`;
    } else {
      var newFileName = `${passage}_${fontProfile}.${timestamp}`;
    }

    logMessage(`${getCallStackTrace()}: current time = ${timestamp}`);

    const duplicateFile = file.makeCopy(newFileName);
    const duplicateFileId = duplicateFile.getId();

    logMessage(`${getCallStackTrace()}: The duplicate file name = ${newFileName}, with file ID = ${duplicateFileId}`);

    return duplicateFileId;
  } catch (err) {
    logMessageError(`${getCallStackTrace()}:  Error duplicating file: ${err.message}`);
    throw new Error(`Failed to duplicate file: ${err.message}`);
  }
}
