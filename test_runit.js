function test_runit() {
  const prompt = "Give me Psalm 23:1 in Traditional Chinese.";
  
  const resultGemini = runit("gemini", prompt);
  logMessage(`Gemini says:\n${resultGemini}`);

  const resultDeepSeek = runit("deepseek", prompt);
  logMessage(`DeepSeek says:\n${resultDeepSeek}`);

  const resultChatGPT = runit("chatgpt", prompt);
  logMessage(`ChatGPT says:\n${resultChatGPT}`);
}
