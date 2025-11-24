const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.send("Gamora API is running...");
});

// Örnek korumalı endpoint
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "This endpoint is only accessible to logged-in users.",
    user: req.user,
  });
});
// Auth routes
app.use("/api/auth", authRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo connection error:", err));

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
