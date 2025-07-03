/** @format */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("./TenderDb/cloudinary");
const fs = require("fs");
const app = express();
const Jwt = require("jsonwebtoken");
const jwtKey = "tenderManagement";
require("dotenv").config();
app.use(cors());
app.use(express.json());

require("./TenderDb/config");
const userModel = require("./TenderDb/singUpModel");
const companyModel = require("./TenderDb/companyMode");
const tenderModel = require("./TenderDb/tenderModel");
const applicationModel = require("./TenderDb/applicationModel");

const upload = multer({ dest: "uploads/" });

app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let users = await userModel.findOne(req.body).select("-password");
    if (users) {
      Jwt.sign(
        { id: users._id, email: users.email },
        jwtKey,
        { expiresIn: "2h" },
        (err, token) => {
          if (err) {
            res.send({ result: "no result found" });
          } else {
            res.send({ users, auth: token });
          }
        }
      );
    } else {
      res.send("user not found");
    }
  } else {
    res.send("no user found");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const users = userModel(req.body);
    let result = await users.save();
    result = result.toObject();
    delete result.password;

    Jwt.sign(
      { id: result._id, email: result.email },
      jwtKey,
      { expiresIn: "2h" },
      (err, token) => {
        if (err) {
          res.send({ result: "no result found" });
        } else {
          res.send({ result, auth: token });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function VerifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        return res.status(401).send({ result: "Please send a valid token" });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(400).send({ result: "Please send token with headers" });
  }
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/create", VerifyToken, async (req, res) => {
  try {
    const { name, industry, description, logoUrl } = req.body;
    const company = await companyModel.create({
      userId: req.user.id,
      name,
      industry,
      description,
      logoUrl,
    });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/read/:id", async (req, res) => {
  try {
    const company = await companyModel.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/updated/:id", VerifyToken, async (req, res) => {
  try {
    const { name, industry, description, logoUrl } = req.body;
    const company = await companyModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, industry, description, logoUrl },
      { new: true }
    );
    if (!company)
      return res.status(404).json({ message: "Not found or unauthorized" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/delete/:id", VerifyToken, async (req, res) => {
  try {
    const company = await companyModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!company)
      return res.status(404).json({ message: "Not found or unauthorized" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tenders", VerifyToken, async (req, res) => {
  try {
    const { title, description, deadline, budget } = req.body;
    const tender = await tenderModel.create({
      userId: req.user.id,
      title,
      description,
      deadline,
      budget,
    });
    res.status(201).json(tender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tenders", VerifyToken, async (req, res) => {
  try {
    const tenders = await tenderModel
      .find({
        $or: [{ isPublic: true }, { userId: { $ne: req.user.id } }],
      })
      .sort({ createdAt: -1 });
    res.json(tenders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tenders/:id", async (req, res) => {
  try {
    const tender = await tenderModel.findById(req.params.id);
    if (!tender) return res.status(404).json({ message: "Not found" });
    res.json(tender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/tenders/:id", VerifyToken, async (req, res) => {
  try {
    const { title, description, deadline, budget } = req.body;
    const tender = await tenderModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, deadline, budget },
      { new: true }
    );
    if (!tender)
      return res.status(404).json({ message: "Not found or unauthorized" });
    res.json(tender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/tenders/:id", VerifyToken, async (req, res) => {
  try {
    const tender = await tenderModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!tender)
      return res.status(404).json({ message: "Not found or unauthorized" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/applications", VerifyToken, async (req, res) => {
  try {
    const { tenderId, proposal } = req.body;
    const newApp = await applicationModel.create({
      tenderId,
      userId: req.user.id,
      proposal,
    });
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/companies", async (req, res) => {
  const { search } = req.query;

  let query = { isPublic: true }; // ✅ Sirf public

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { industry: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const companies = await companyModel.find(query).limit(50);
  res.json(companies);
});

app.get("/my-companies", VerifyToken, async (req, res) => {
  const companies = await companyModel.find({ userId: req.user.id });
  res.json(companies);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
