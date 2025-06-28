const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;
const fm_service_base_url = process.env.FM_SERVICE_BASE_URL;

const redis_username = process.env.REDIS_USERNAME
const redis_host = process.env.REDIS_HOST
const redis_password = process.env.REDIS_PASSWORD
const redis_port = process.env.REDIS_PORT


const config = {
  port,
  mongo_url,
  redis_url,
  fm_service_base_url,
  redis_host,
  redis_username,
  redis_password,
  redis_port
};

module.exports = config;
