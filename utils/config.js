const dotenv = require("dotenv");

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined) {
  dotenv.config();
}

const port = process.env.PORT || 3000; 
const mongo_url = process.env.MONGO_URL || "mongodb://localhost:27017/your_app_dev_db"; 
const fm_service_base_url = process.env.FM_SERVICE_BASE_URL || "http://localhost:8000/api"; 

// Redis variables - provide defaults or ensure they are set in .env/env vars
const redis_username = process.env.REDIS_USERNAME || "";
const redis_host = process.env.REDIS_HOST || "localhost";
const redis_password = process.env.REDIS_PASSWORD || "";
const redis_port = process.env.REDIS_PORT || 6379;

const redis_url = process.env.REDIS_URL || `redis://${redis_username}${redis_password ? ':' + redis_password + '@' : ''}${redis_host}:${redis_port}`;


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
