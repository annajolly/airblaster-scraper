require("dotenv").config();

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;

const axios = require("axios").create({
  baseURL: BASE_URL,
});

const getUpdates = () => axios.get("/getUpdates");

const sendMessage = (message) =>
  axios.post("/sendMessage", {
    chat_id: process.env.CHAT_ID,
    text: message,
  });

module.exports = {
  getUpdates,
  sendMessage,
};
