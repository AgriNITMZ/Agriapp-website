// services/translateService.js
const { TranslationServiceClient } = require("@google-cloud/translate").v3;

// init client
const client = new TranslationServiceClient();

// Google project & location
// const projectId = process.env.GCLOUD_PROJECT_ID; correct one
const projectId = process.env.GCLOUD_PROJECTI_ID; // wrong but using to avoid the token limit reached issue

const location = "global";

// translate text
async function translateText(text, targetLang = "en") {
  if (!text) return "";

  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: "text/plain",
    targetLanguageCode: targetLang,
  };

  const [response] = await client.translateText(request);
  return response.translations[0].translatedText;
}

module.exports = { translateText };
