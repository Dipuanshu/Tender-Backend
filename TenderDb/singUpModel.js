/** @format */

const mongoose = require("mongoose");
const Tenderschema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
module.exports = mongoose.model("singups", Tenderschema);
