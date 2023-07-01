const express = require("express");
const axios = require("axios");
const { NFTStorage, File } = require("nft.storage");
// The 'mime' npm package helps us set the correct file type on our File objects
const mime = require("mime");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/imagine", async (req, res) => {
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

app.post("/result", async (req, res) => {
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

app.post("/upload", async (req, res) => {
  const imageURL = req.body.imageURL;

  // Download the image
  const response = await fetch(imageURL);
  const buffer = await response.buffer();
  fs.writeFileSync("./image.png", buffer);

  // initialize NFT Storage
  const nftStorage = new NFTStorage({
    token: process.env.REACT_APP_NFT_STORAGE_API_KEY,
  });

  // store image
  try {
    const { ipnft } = await nftStorage.store({
      image: new File(
        [fs.readFileSync(path.join(__dirname, "./image.png"))],
        "image.png",
        { type: "image/png" }
      ),
      name: req.body.name,
      description: req.body.description,
    });
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
