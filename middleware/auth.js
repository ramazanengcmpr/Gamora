// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Access tokeni çöz
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı DB'den çek
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // tokenVersion uyuşmazsa: eski/iptal token
    if (payload.tokenVersion !== user.tokenVersion) {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    }

    // Request’e user bilgisini ekle
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
