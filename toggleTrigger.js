function toggleTrigger(action, provider) {
  if (!provider) {
    throw new Error("Missing AI provider name. Provide action and AI provider name.");
  }

  let functionName;

  switch (provider.toLowerCase()) {
    case "gemini":
      functionName = "run_gemini";
      break;
    case "deepseek":
      functionName = "run_deepseek";
      break;
    case "chatgpt":
      functionName = "run_chatgpt";
      break;
    default:
      throw new Error(`Unknown provider: ${provider}. Use 'gemini', 'deepseek', or 'chatgpt'.`);
  }

  if (action === "enable") {
    removeTrigger(functionName);

    ScriptApp.newTrigger(functionName)
      .timeBased()
      .everyMinutes(15)
      .create();

    logMessage(`${getCallStackTrace()}: Trigger enabled for ${functionName} every 15 min.`);
  } else if (action === "disable") {
    removeTrigger(functionName);
    logMessage(`${getCallStackTrace()}: Trigger disabled for ${functionName}.`);
  } else {
    throw new Error('Invalid action. Use "enable" or "disable".');
  }
}

function removeTrigger(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  for (const t of triggers) {
    if (t.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(t);
    }
  }
}

