function test_getInvoInfo() {
  //logMessage("=== Testing Gemini ===");
  //const refGemini = getInvoInfoAPI(true, "gemini");
  //logMessage(`Gemini → ${JSON.stringify(refGemini)}`);

  logMessage("=== Testing DeepSeek ===");
  const refDeepSeek = getInvoInfoAPI(true, "deepseek");
  logMessage(`DeepSeek → ${JSON.stringify(refDeepSeek)}`);

  //logMessage("=== Testing ChatGPT ===");
  //const refChatGPT = getInvoInfoAPI(true, "chatgpt");
  //logMessage(`ChatGPT → ${JSON.stringify(refChatGPT)}`);
}
