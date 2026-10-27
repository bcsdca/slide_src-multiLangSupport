function run_gemini() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using gemini API===`);
  
  const provider = "gemini";
  const isTesting = false;
  const usingJSONBible = false;
  const language = "bilingualEnglishFirst";
  const fontProfile = "small";
  
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
  
}
