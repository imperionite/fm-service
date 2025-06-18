const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;
const mongo_url_test = process.env.MONGO_URL_TEST;
const redis_url = process.env.REDIS_URL;
const fm_service_base_url = process.env.FM_SERVICE_BASE_URL;

const config = {
  port,
  mongo_url,
  mongo_url_test,
  redis_url,
  fm_service_base_url
};

module.exports = config;
