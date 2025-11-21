// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Helper: JWT üret
function createToken(user) {
  const payload = {
    userId: user._id,
    tokenVersion: user.tokenVersion, // kritik kısım
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m", // 15 dakika – çalınsa bile süresi kısa
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  console.log("REQ BODY:", req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "This email is already registered" });
    }

    // Hash rounds: 12 = daha güçlü
    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "User successfully created",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid information" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid information" });
    }

    const token = createToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/logout-all
// Tüm cihazlardan çıkış: tokenVersion++ -> eski tüm tokenlar geçersiz
router.post("/logout-all", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 },
    });

    return res.json({
      message:
        "All devices have been logged out. All old tokens are now invalid.",
    });
  } catch (err) {
    console.error("Logout-all error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Örnek korumalı route: /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  return res.json({
    user: req.user,
  });
});

module.exports = router;
