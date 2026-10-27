function test_gemini() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using gemini API===`);
  
  const provider = "gemini";
  const isTesting = true;
  const usingJSONBible = true;
  const language = "bilingualEnglishFirst";
  const fontProfile = "small";
  
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
  
}
