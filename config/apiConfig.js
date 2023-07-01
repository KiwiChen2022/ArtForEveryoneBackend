require("dotenv").config();

const midjourneyApiKey = process.env.REACT_APP_MIDJOURNEY_API_KEY;

const apiConfig = {
  postRequest: {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.midjourneyapi.io/v2/imagine",
    headers: {
      Authorization: `${midjourneyApiKey}`,
      "Content-Type": "application/json",
    },
    data: data,
  },
};

module.exports = apiConfig;
