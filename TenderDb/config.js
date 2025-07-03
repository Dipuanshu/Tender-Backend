/** @format */

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI) // ✅ Capital + underscore match karo
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err));
