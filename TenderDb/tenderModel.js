/** @format */

const mongoose = require("mongoose");

const TenderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  deadline: Date,
  budget: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tender", TenderSchema);
