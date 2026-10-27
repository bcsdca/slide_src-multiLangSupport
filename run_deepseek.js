function run_deepseek() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using deepseek API===`);

  const isTesting = false;
  const usingJSONBible = true;
  const provider = "deepseek";
  const language = "bilingualEnglishFirst";
  const fontProfile = "large";
  //const fontProfile = "small";
  
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
  
}
