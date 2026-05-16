function mainScheduler() {
  const today = new Date();

  // Get the date of the month (1–31)
  const day = today.getDate();

  // Determine which Friday it is (1st, 2nd, 3rd, 4th, 5th)
  const weekOfMonth = Math.ceil(day / 7);

  logMessage(`${getCallStackTrace()}: Today is the ${weekOfMonth} Friday`);

  switch (weekOfMonth) {
    case 1:
      run_deepseek();
      break;
    case 2:
      run_gemini();
      break;
    case 3:
      run_chatgpt();
      break;
    case 4:
      run_deepseek();
      break;
    case 5:
      run_gemini();
      break;
  }
}

function startMainScheduler() {
  // Prevent duplicate triggers
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'mainScheduler');

  if (exists) {
    logMessage(`${getCallStackTrace()}: mainScheduler trigger already exists.`);
    return;
  }

  ScriptApp.newTrigger('mainScheduler')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(18) // 6 PM
    .create();

  logMessage(`${getCallStackTrace()}: mainScheduler trigger started.`);
}

function stopMainScheduler() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'mainScheduler') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  logMessage(`${getCallStackTrace()}: mainScheduler trigger stopped.`);
  
}