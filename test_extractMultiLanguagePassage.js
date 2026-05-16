function test_extractMultiLanguagePassage() {
  //passageInput = "詩篇 100: 1-5";
  //passageInput = "詩篇 1: 1-5";
  //passageInput = "以斯帖記 8:8-10";
  //passageInput = "創世記 1:10-2:2";
  //passageInput = "創世記 (Genesis) 1:1-2";
  //passageInput = "創世記 (Genesis) 1";
  //passageInput = "創世記 7:13a-8:2b";
  //passageInput = "創世記 7:13a-24";
  //passageInput = "路加福音 Luke 9: 57-62a";
  //passageInput = "哥林多前書 13:4-8a";
  //passageInput = "路得記 1:1-7，14-19a";
  //passageInput = "哥林多前書 1 Corinthians 13:2-6a,8b";
  //passageInput = "哥林多前書 1 Corinthians 13:6a";
  //passageInput = "哥林多前書 1 Corinthians 13:6-8";
  //passageInput = "哥林多前書 1 Corinthians 13:8b";
  //passageInput = "帖撒羅尼迦前書 5:16-20";

  //var passageInput = "詩篇 Psalm 113:1-4";
  //var passageInput = "約翰福音 21:12-19";
  startingRow = 1
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("passage");
  //const languageChosen = "chinese";
  //const languageChosen = "english";
  //const languageChosen = "bilingual";
  //const languageChosen = "bilingualEnglishFirst";
  const languageChosen = "bilingualChineseFirst";
  const provider = "deepseek";
  //const usingJSONBible = false;
  const usingJSONBible = true;
  //const fontProfile = "medium";
  passageInput = "路加福音 Luke 2:21-39";
  //passageInput = "創世記 7:13a-24";
  //const fontProfile = "small";
  const fontProfile = "medium";
  //const fontProfile = "large";
  extractMultiLanguagePassage(passageInput, sheet, startingRow, languageChosen, provider, usingJSONBible, fontProfile);

  //passageInput = "帖撒羅尼迦前書 5:16-20";
  //const fontProfile = "medium";
  //extractMultiLanguagePassage(passageInput, sheet, startingRow, languageChosen, provider, usingJSONBible, fontProfile);

  //passageInput = "以斯帖記 8:8-10";
  //const fontProfile = "large";
  //extractMultiLanguagePassage(passageInput, sheet, startingRow, languageChosen, provider, usingJSONBible, fontProfile);

  createPassageSlide(passageInput,fontProfile);

}