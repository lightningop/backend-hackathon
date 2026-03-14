const axios = require("axios");

const API_KEY = process.env.TRANSLATOR_KEY;
const REGION = process.env.TRANSLATOR_REGION;
const ENDPOINT = "https://api.cognitive.microsofttranslator.com";

async function translateText(text, target) {
  const response = await axios({
    baseURL: ENDPOINT,
    url: "/translate",
    method: "post",
    params: {
      "api-version": "3.0",
      to: target
    },
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY,
      "Ocp-Apim-Subscription-Region": REGION,
      "Content-type": "application/json"
    },
    data: [
      { Text: text }
    ]
  });

  return response.data[0].translations[0].text;
}

module.exports = { translateText };