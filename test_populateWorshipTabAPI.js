function test_populateWorshipTabAPI() {
  const isTesting = true;
  //const usingJSONBible = true;
  const usingJSONBible = false;
  const provider = "deepseek";
  const language = "bilingual";
    
  logMessage(`${getCallStackTrace()}: === Testing DeepSeek ===`);
  populateWorshipTabAPI(provider, language, isTesting, usingJSONBible)
   
  
}
