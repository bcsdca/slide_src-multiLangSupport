function run_deepseek() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using deepseek API===`);

  const isTesting = true;
  const usingJSONBible = false;
  const provider = "deepseek";
  const language = "bilingualChineseFirst";
  const fontProfile = "large";
  //const fontProfile = "small";
  
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
  
}
