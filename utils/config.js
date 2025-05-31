const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;
const mongo_url_test = process.env.MONGO_URL_TEST;

const config = {
  port,
  mongo_url,
  mongo_url_test,
};

module.exports = config;
