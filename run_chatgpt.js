function run_chatgpt() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using chatgpt API===`);
  
  const provider = "chatgpt";
  
  const isTesting = true;
  const usingJSONBible = false;
  //const provider = "deepseek";
  const language = "bilingualChineseFirst";
  const fontProfile = "medium";
  //const fontProfile = "small";
  
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
    
}
