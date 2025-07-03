const mongoose = require("mongoose");
const config = require("./config");
let mongoServer = null;

async function connectDB() {
  let dbURL;

  if (process.env.NODE_ENV === "test") {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    dbURL = mongoServer.getUri();
  } else {
    dbURL = config.mongo_url;
  }

  try {
    await mongoose.connect(dbURL);

    console.log(`Database connected: ${dbURL}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
