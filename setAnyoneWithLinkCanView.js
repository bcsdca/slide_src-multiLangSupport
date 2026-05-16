function setAnyoneWithLinkCanView(FileId) {
  const file = DriveApp.getFileById(FileId);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  logMessage(getCallStackTrace() + ': file access set to "Viewer" for anyone with the link.');
}