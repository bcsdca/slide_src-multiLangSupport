function test_chatgpt() {
  logMessage(`${getCallStackTrace()}: === Running populateWorshipTabAPI using chatgpt API===`);
  
  const provider = "chatgpt";
  const isTesting = true;
  const usingJSONBible = false;
  const language = "bilingualChineseFirst";
  const fontProfile = "medium";
    
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible, fontProfile)
    
}
