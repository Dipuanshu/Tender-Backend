/** @format */

const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  industry: String,
  description: String,
  logoUrl: String,
});

module.exports = mongoose.model("Company", CompanySchema);
