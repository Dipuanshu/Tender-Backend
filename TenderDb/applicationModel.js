/** @format */

const mongoose = require("mongoose");
const ApplicationSchema = new mongoose.Schema(
  {
    tenderId: { type: mongoose.Schema.Types.ObjectId, ref: "Tender" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    proposal: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("Application", ApplicationSchema);
