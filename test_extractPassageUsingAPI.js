function test_extractPassageUsingAPI() {
  passageInput = "路加福音 Luke 9: 57-62";
  startingRow = 2
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("worship");
  //extractPassageUsingAPI(passageInput, sheet, startingRow, "gemini")
  extractPassageUsingAPI(passageInput, sheet, startingRow, "deepseek")
  //extractPassageUsingAPI(passageInput, sheet, startingRow, "chatgpt")
}

