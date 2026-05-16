function editJSONFile() {

  const fileName = "nivBible.json";

  const files = DriveApp.getFilesByName(fileName);

  if (!files.hasNext()) {
    throw new Error("File not found: " + fileName);
  }

  const file = files.next();
  const content = file.getBlob().getDataAsString();

  const data = JSON.parse(content);

  const updatedData = {};

  for (const [key, value] of Object.entries(data)) {

    if (key === "psalm") {
      updatedData["psalms"] = value;
    } else {
      updatedData[key] = value;
    }
  }

  file.setContent(JSON.stringify(updatedData, null, 2));
}