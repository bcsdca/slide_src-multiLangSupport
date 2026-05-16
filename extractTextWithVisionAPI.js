function extractTextWithVisionAPI(attachment) {

  //serviceAccountFileId is a global variable

  const credsBlob = DriveApp.getFileById(serviceAccountFileId).getBlob();
  const creds = JSON.parse(credsBlob.getDataAsString());
  const token = getAccessTokenFromServiceAccount(creds);

  try {
    // Ensure we have a Blob object
    let pdfBlob;
    if (attachment.getDataAsString && typeof attachment.getContentType === 'function' && typeof attachment.getName === 'function') {
      // Likely a Google Apps Script Attachment object (e.g., from Gmail)
      pdfBlob = attachment;
    } else if (attachment instanceof Blob) {
      // Already a Blob object (e.g., from UrlFetchApp.fetch().getBlob())
      pdfBlob = attachment;
    } else {
      logMessageError(`${getCallStackTrace()}: Error: Invalid attachment object provided.`);
      return;
    }

    const base64Content = Utilities.base64Encode(pdfBlob.getBytes());

    const visionPayload = {
      requests: [{
        inputConfig: {
          mimeType: pdfBlob.getContentType(),
          content: base64Content
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
      }]
    };

    const response = UrlFetchApp.fetch("https://vision.googleapis.com/v1/files:annotate", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(visionPayload),
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const result = JSON.parse(response.getContentText());
    //this line might caused this error "Your input contains more than the maximum of 50000 characters in a single cell.", in the execution log
    //because it try to fill a lot of char in one cell in the runLog
    //logMessage(`${getCallStackTrace()}: ${JSON.stringify(result, null, 2)}`); // Keep this for debugging

    let fullText = "";
    if (result.responses && result.responses.length > 0 && result.responses[0].responses && result.responses[0].responses.length > 0) {
      const firstResponse = result.responses[0].responses[0];
      if (firstResponse?.fullTextAnnotation?.text) {
        fullText = firstResponse.fullTextAnnotation.text;
      }
    }

    // Split the fullText into individual announcements
    const announcementArray = [];
    //const announcementRegex = /(\d+)\.\s*\n(.*?)(?=\n\d+\.|\n*$)/gs;
    const announcementRegex = /(\d+)\.\s*(.*?)(?=\n\d+\.|\n*$)/gs;

    let match;
    while ((match = announcementRegex.exec(fullText)) !== null) {
      const announcementNumber = match[1];    // e.g., "1"
      const announcementDetail = match[2]     // e.g., "福音主日: ..."
        .replace(/\n/g, " ")                  // Remove newlines in the detail
        .trim();

      // Combine the number and the detail without a newline after the number
      announcementArray.push(`${announcementNumber}. ${announcementDetail}`);
    }

    if (fullText) {
      logMessage(`${getCallStackTrace()}: fullText = ${fullText}`);
      logMessage(`${getCallStackTrace()}: 📢 Announcements Array: ${JSON.stringify(announcementArray, null, 2)}`);
      return announcementArray;
    } else {
      logMessage(`${getCallStackTrace()}: No text found in the attachment.`);
    }

  } catch (error) {
    logMessageError(`${getCallStackTrace()}: Error processing attachment: ${error}`);
  }
}

// 🔑 Generate access token using service account
function getAccessTokenFromServiceAccount(creds) {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: creds.token_uri,
    exp: now + 3600,
    iat: now
  };

  const jwt = [
    Utilities.base64EncodeWebSafe(JSON.stringify(header)),
    Utilities.base64EncodeWebSafe(JSON.stringify(claim))
  ].join(".");

  const signatureBytes = Utilities.computeRsaSha256Signature(jwt, creds.private_key);
  const signedJwt = jwt + "." + Utilities.base64EncodeWebSafe(signatureBytes);

  const response = UrlFetchApp.fetch(creds.token_uri, {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt
    }
  });

  return JSON.parse(response.getContentText()).access_token;
}