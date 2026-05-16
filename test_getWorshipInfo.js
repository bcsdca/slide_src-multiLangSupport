function test_getWorshipInfo() {
  //logMessage("=== Testing Gemini ===");
  //const refGemini = getWorshipInfoAPI(true, "gemini");
  //logMessage(`Gemini → ${JSON.stringify(refGemini)}`);

  //logMessage("=== Testing DeepSeek ===");
  //const refDeepSeek = getWorshipInfoAPI(true, "deepseek");
  //logMessage(`DeepSeek → ${JSON.stringify(refDeepSeek)}`);

  logMessage("=== Testing ChatGPT ===");
  const refChatGPT = getWorshipInfoAPI(true, "chatgpt");
  logMessage(`ChatGPT → ${JSON.stringify(refChatGPT)}`);
}
