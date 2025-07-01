const config = require("./utils/config");
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");

const mongoose = require("mongoose");
const { connectDB } = require("./utils/db"); // connectDB now handles test/prod logic internally

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger");

const seedService = require("./seeds/service");
const serviceRouter = require("./routes/service");

const app = express();

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

app.use(express.static(path.join(__dirname, "public")));

// ALWAYS call connectDB(). It handles the conditional logic for test/real DB.
connectDB().then(async () => {
  // Only seed services if NOT in test environment
  if (process.env.NODE_ENV !== "test") {
    await seedService();
  }
}).catch(error => {
  console.error(`MongoDB initial connection error during app startup: ${error}`);
  // In a real app, you might want to exit the process if DB connection is critical
  // process.exit(1);
});

// Mongoose connection error listener should always be active
mongoose.connection.on("error", (error) => {
  console.error(`MongoDB connection error: ${error}`);
});


// API routes
app.use("/api/services", serviceRouter);
// route for API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "upgrade-insecure-requests": [],
      },
    },
  })
);

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
