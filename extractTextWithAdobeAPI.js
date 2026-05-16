// Main Function
function extractTextWithAdobeAPI(attachment) {
  let annoArray = [];
  try {
    logMessage(`${getCallStackTrace()}: 🚀 Starting PDF text extraction process...`);

    // Step 1: Get the PDF file from Google Drive
    const { blob, fileName } = getPdfFileFromAttachment(attachment);
    logMessage(`${getCallStackTrace()}: 📄 File Name: ${fileName}`);
    logMessage(`${getCallStackTrace()}: 📦 Blob Size: ${blob.getBytes().length} bytes`);

    // Step 2: Get Adobe Access Token
    // ADOBE_CONFIG is a global variable
    const accessToken = getAdobeAccessToken(ADOBE_CONFIG.ADOBE_CREDENTIALS);
    logMessage(`${getCallStackTrace()}: 🔑 Access Token: ${accessToken}`);

    // Step 3: Get Upload URI and Asset ID
    const { uploadUri, assetID } = getUploadUriAndAssetId(accessToken, ADOBE_CONFIG.ADOBE_CREDENTIALS);
    if (!uploadUri || !assetID) throw new Error("Failed to get Upload URI and Asset ID.");

    // Step 4: Upload the PDF file to Adobe's cloud storage
    if (!uploadFileToCloud(blob, uploadUri)) throw new Error("Failed to upload file.");

    // Step 5: Create the extraction job
    const jobLocation = createExtractionJob(accessToken, ADOBE_CONFIG.ADOBE_CREDENTIALS, assetID);
    if (!jobLocation) throw new Error("Failed to create extraction job.");

    // Step 6: Poll for job completion and download the result
    annoArray = downloadExtractionResult(accessToken, ADOBE_CONFIG.ADOBE_CREDENTIALS, jobLocation);

    logMessage(`${getCallStackTrace()}: 🎉 PDF text extraction process completed successfully!`);
  } catch (error) {
    logMessage(`${getCallStackTrace()}: ❌ Error: ${error.message}`);
  }
  return annoArray;
}

/**
 * Get PDF file details from a Gmail attachment.
 * @param {GmailAttachment} attachment - The Gmail attachment object.
 * @returns {Object} - An object containing the blob and file name.
 */
function getPdfFileFromAttachment(attachment) {
  return {
    blob: attachment.copyBlob(), // Create a copy of the attachment blob
    fileName: attachment.getName(), // Get the attachment file name
  };
}

// -----------------------------------------------------
// ✅ Function: Get Adobe Access Token
// -----------------------------------------------------
function getAdobeAccessToken(credentials) {
  const payload = `client_id=${encodeURIComponent(credentials.client_id)}&` +
    `client_secret=${encodeURIComponent(credentials.client_secret)}&` +
    `grant_type=client_credentials&` +
    `scope=openid AdobeID DCAPI`;

  const options = {
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    payload: payload,
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(ADOBE_CONFIG.API_ENDPOINTS.TOKEN, options);
  const result = JSON.parse(response.getContentText());

  if (!result.access_token) {
    throw new Error("Failed to retrieve access token.");
  }

  return result.access_token;
}

// -----------------------------------------------------
// ✅ Function: Get Upload URI and Asset ID
// -----------------------------------------------------
function getUploadUriAndAssetId(accessToken, credentials) {
  const uploadPayload = { mediaType: "application/pdf" };

  const options = {
    method: "post",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "x-api-key": credentials.client_id,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(uploadPayload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(ADOBE_CONFIG.API_ENDPOINTS.ASSETS, options);
  const responseJson = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    throw new Error("Failed to get Upload URI and Asset ID.");
  }

  return {
    uploadUri: responseJson.uploadUri,
    assetID: responseJson.assetID,
  };
}

// -----------------------------------------------------
// ✅ Function: Upload File to Cloud
// -----------------------------------------------------
function uploadFileToCloud(blob, uploadUri) {
  const options = {
    method: "put",
    headers: { "Content-Type": "application/pdf" },
    payload: blob.getBytes(),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(uploadUri, options);
  if (response.getResponseCode() !== 200) {
    throw new Error("Failed to upload file.");
  }

  return true;
}

// -----------------------------------------------------
// ✅ Function: Create Extraction Job
// -----------------------------------------------------
function createExtractionJob(accessToken, credentials, assetID) {
  const extractPayload = {
    assetID: assetID,
    getCharBounds: false,
    includeStyling: false,
    elementsToExtract: ["text", "tables"],
    renditionsToExtract: ["tables", "figures"],
    includeHeaderFooter: false,
    tagEncapsulatedText: ["Figure"],
  };

  const options = {
    method: "post",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "x-api-key": credentials.client_id,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(extractPayload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(ADOBE_CONFIG.API_ENDPOINTS.EXTRACT, options);
  if (response.getResponseCode() !== 201) {
    throw new Error(`${getCallStackTrace()}: Failed to create extraction job.`);
  }

  const locationHeader = response.getHeaders()["Location"];
  if (!locationHeader) {
    throw new Error(`${getCallStackTrace()}: Job location header missing.`);
  }

  return locationHeader;
}

// -----------------------------------------------------
// ✅ Function: Poll for Job Completion and Download Result
// -----------------------------------------------------
function downloadExtractionResult(accessToken, credentials, jobLocation) {
  let attempt = 0;
  let jobDone = false;
  let downloadUri = null;

  // Split the plainText into individual announcements
  const announcementArray = [];
  const announcementRegex = /(\d+)\.\s*\n(.*?)(?=\n\d+\.|\n*$)/gs;

  logMessage(`${getCallStackTrace()}: 🔁 Polling for job completion...`);

  while (attempt < ADOBE_CONFIG.POLLING.MAX_ATTEMPTS && !jobDone) {
    const pollingResponse = UrlFetchApp.fetch(jobLocation, {
      method: "get",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": credentials.client_id,
      },
      muteHttpExceptions: true,
    });

    const responseCode = pollingResponse.getResponseCode();
    const responseText = pollingResponse.getContentText();

    logMessage(`${getCallStackTrace()}: ⏳ Polling Attempt ${attempt + 1} of ${ADOBE_CONFIG.POLLING.MAX_ATTEMPTS}`);
    logMessage(`${getCallStackTrace()}: Response Code: ${responseCode}`);
    logMessage(`${getCallStackTrace()}: Response Text: ${responseText}`);

    if (responseCode !== 200) {
      attempt++;
      Utilities.sleep(ADOBE_CONFIG.POLLING.INTERVAL);
      continue;
    }

    const pollResponseJson = JSON.parse(responseText);

    if (pollResponseJson.status === "done") {
      logMessage(`${getCallStackTrace()}: ✅ Job Status: done`);
      jobDone = true;

      // Extract download URI
      downloadUri = pollResponseJson.content?.downloadUri || pollResponseJson.resource?.downloadUri;
      if (!downloadUri) {
        throw new Error("No download URI found.");
      }

      logMessage(`${getCallStackTrace()}: Download URI: ${downloadUri}`);

      // Download the result
      const downloadResponse = UrlFetchApp.fetch(downloadUri, {
        method: "get",
        muteHttpExceptions: true,
      });

      if (downloadResponse.getResponseCode() === 200) {
        const resultJson = JSON.parse(downloadResponse.getContentText());

        // Extract plain text from the JSON
        let plainText = "";
        if (resultJson.elements && Array.isArray(resultJson.elements)) {
          resultJson.elements.forEach((element) => {
            if (element.Text) {
              plainText += element.Text + "\n"; // Add a newline after each text element
            }
          });
        }
        
        let match;
        while ((match = announcementRegex.exec(plainText)) !== null) {
          const announcementNumber = match[1];    // e.g., "1"
          const announcementDetail = match[2]     // e.g., "福音主日: ..."
            .replace(/\n/g, " ")                  // Remove newlines in the detail
            .trim();

          // Combine the number and the detail without a newline after the number
          announcementArray.push(`${announcementNumber}. ${announcementDetail}`);
        }

        // Save the plain text to a file
        const fileName = "extracted_text.txt";
        const file = DriveApp.createFile(fileName, plainText, MimeType.PLAIN_TEXT);
        logMessage(`${getCallStackTrace()}: ✅ Plain text saved: ${file.getUrl()}`);
        
      } else {
        logMessage(`${getCallStackTrace()}: ❌ Failed to download result.`);
        throw new Error(`${getCallStackTrace()}: Failed to download result. Status: ${downloadResponse.getResponseCode()}`);
      }
    } else if (pollResponseJson.status === "failed") {
      throw new Error(`${getCallStackTrace()}: Job failed.`);
    } else {
      logMessage(`${getCallStackTrace()}: ⏳ Job Status: ${pollResponseJson.status}`);
    }

    attempt++;
    Utilities.sleep(ADOBE_CONFIG.POLLING.INTERVAL);
  }

  if (!jobDone) {
    throw new Error(`${getCallStackTrace()}: Job did not complete within max attempts.`);
  }
  logMessage(`${getCallStackTrace()}: 📢 Announcements Array: ${JSON.stringify(announcementArray, null, 2)}`);
  return announcementArray;
}