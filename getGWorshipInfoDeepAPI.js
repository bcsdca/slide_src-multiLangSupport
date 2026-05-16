function getGWorshipInfoDeepAPI(isTesting) {
  //const worshipGmailInfo = getWorshipGmail(isTesting);
  //change to get the gmail body in html format
  const worshipGmailInfo = getGWorshipHTMLGmail(isTesting);
  if (worshipGmailInfo.success) {

    // 1. Your preferred simple prompt
    //const prompt = `Extract these 3 items from the church service email:
    //change the prompt to tell deepseek api to get the gmail body in html format
    const prompt = `Extract ONLY THE FIRST OCCURRENCE of these items from the HTML body, and removed all the "*", but including the whole line, please include the punctuation mark like the parenthesis and double quotes in the sermon title:
    1. Scripture Reading passage
    2. Sermon Title
    3. Speaker
  
    Return as a valid JSON object with these keys:
      {
      "scriptureReading": "讀經 Scripture Reading" + "extracted text",
      "sermon": "證道 Sermon" + "extracted text",
      "speaker": ""講員 Speaker" + extracted text"
    }
  
    Email content:
    ${worshipGmailInfo.message}`;

    try {
      // 2. API Request
      const response = UrlFetchApp.fetch(deepSeekAPIUrl, {
        method: "post",
        headers: {
          "Authorization": `Bearer ${deepSeekAPIKey}`,
          "Content-Type": "application/json"
        },
        payload: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,  // Low for consistency
          max_tokens: 200
        }),
        muteHttpExceptions: false
      });

      // 3. Debug raw response
      const responseText = response.getContentText();
      logMessage(`${getCallStackTrace()}: Raw API Response: ${responseText}`);


      // 4. Parse response
      const responseData = JSON.parse(responseText);
      // The content is a JSON string that needs to be parsed
      const worshipInfo = JSON.parse(responseData.choices[0].message.content);

      // 6. Basic existence check
      if (!worshipInfo.scriptureReading || !worshipInfo.sermon || !worshipInfo.speaker) {
        throw new Error(`${getCallStackTrace()}: Missing one or more required fields`);
      }

      //const annoArray = getOldestAnnouncementNumbersDeepAPI(worshipGmailInfo.message);
      const annoArray = [1,2,3];
      worshipInfo.annoArray = annoArray;  // Add the new property
      worshipInfo.attachment = worshipGmailInfo.attachment;
      logMessage(`${getCallStackTrace()}: worshipInfo = ${JSON.stringify(worshipInfo, null, 2)}`);
      return worshipInfo;

    } catch (error) {
      logMessageError(`${getCallStackTrace()}: API Error= ${error}`);
      return;
    }
    
  } else {
    logMessage(`${getCallStackTrace()}: No worship info found or an error occurred.`);
  }
}

