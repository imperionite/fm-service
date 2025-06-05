const config = require("./utils/config");
const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");

const app = express();
const seedService = require("./seeds/service");
const serviceRouter = require("./routes/service");

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

let dbURL;
if (process.env.NODE_ENV === "test") {
  dbURL = config.mongo_url_test;
} else {
  dbURL = config.mongo_url;
}

async function connectDB() {
  try {
    await mongoose.connect(dbURL);
    // Run the seeding logic
    await seedService();

    console.log(`Database connected: ${dbURL}`);
  } catch (error) {
    console.error(`Connection error: ${error}`);
  }
}

connectDB();

const db = mongoose.connection;
db.on("error", (error) => {
  console.error(`MongoDB connection error: ${error}`);
});

app.use("/api/services", serviceRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
