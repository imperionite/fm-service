const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    // Unique name of the service, e.g. "Financial Analysis for Retail - Profitability Optimization"
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // High-level classification (e.g., "Business Intelligence")
    category: {
      type: String,
      enum: [
        "Financial Analysis",
        "Marketing Analytics",
        "Business Intelligence",
        "Consulting Services",
      ],
      required: true,
    },
    // The target industry vertical, e.g., "Healthcare"
    industry: {
      type: String,
      enum: ["Retail", "E-commerce", "Healthcare", "Manufacturing"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Time required to deliver the service (from a predefined set)
    duration_hours: {
      type: Number, 
      enum: [1, 2, 4, 8, 12],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Service", ServiceSchema);
