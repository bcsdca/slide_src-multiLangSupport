function test_extractPassageUsingCuvBible() {
  //passageInput = "路加福音 Luke 9: 57-62";
  passageInput = "路加福音 Luke 9: 57-62a";
  //passageInput = "路加福音 Luke 9:57-10:5";
  //passageInput = "路加福音 9: 57-62";
  //passageInput = "彼得前書1Peter 2:4-10";
  startingRow = 2
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("worship");
  //extractPassageUsingAPI(passageInput, sheet, startingRow, "gemini")
  extractPassageUsingCuvBible(passageInput, sheet, startingRow, "deepseek")
  //extractPassageUsingAPI(passageInput, sheet, startingRow, "chatgpt")
}

