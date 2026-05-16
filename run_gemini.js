function run_gemini() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using gemini API===`);
  
  const provider = "gemini";
  const isTesting = true;
  const usingJSONBible = false;
  //const provider = "deepseek";
  //const language = "bilingualChineseFirst";
  const language = "bilingualEnglishFirst";
  //const fontProfile = "large";
  const fontProfile = "small";
  
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
  
}
