const express = require("express");
const axios = require("axios");
const { NFTStorage, File } = require("nft.storage");
// The 'mime' npm package helps us set the correct file type on our File objects
const mime = require("mime");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/api/imagine", async (req, res) => {
  const prompt = req.body.prompt;
  console.log("prompt", prompt);
  const data = JSON.stringify({
    prompt: prompt,
  });
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.midjourneyapi.io/v2/imagine",
    headers: {
      Authorization: `${process.env.MIDJOURNEY_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  console.log("config", config);
  try {
    const response = await axios.request(config);
    res.json({ taskId: response.data.taskId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/api/result", async (req, res) => {
  const taskId = req.body.taskId;
  const resultData = JSON.stringify({ taskId });
  const resultConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.midjourneyapi.io/v2/result",
    headers: {
      Authorization: `${process.env.MIDJOURNEY_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: resultData,
  };
  console.log("resultConfig", resultConfig);

  try {
    const resultResponse = await axios.request(resultConfig);
    res.json(resultResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/api/upscale", async (req, res) => {
  const { taskId, position, callbackURL } = req.body;
  const upscaleData = JSON.stringify({ taskId, position, callbackURL });
  const upscaleConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.midjourneyapi.io/v2/upscale",
    headers: {
      Authorization: `${process.env.MIDJOURNEY_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: upscaleData,
  };
  console.log("upscaleConfig", upscaleConfig);

  try {
    const upscaleResponse = await axios.request(upscaleConfig);
    res.json(upscaleResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/api/chat", async (req, res) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
    });
    const chatGptMessage = completion.data.choices[0].message;
    console.log("chatGptMessage", chatGptMessage);
    res.json({ message: chatGptMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
