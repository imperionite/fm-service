const config = require("./config");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FM Service API",        
      version: "1.0.0",              
      description: "API documentation of FM Service API, another backend API of Finer FinMark's Online Ordering System project.", 
      termsOfService: "http://example.com/terms/", // Optional
      contact: {
        name: "Imperionite",
        url: "https://github.com/imperionite",
        email: "support@your-website.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: config.fm_service_base_url,
        description: "API DOC server",
      },
      // Add more servers if needed
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"], // Paths to files with JSDoc comments
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
