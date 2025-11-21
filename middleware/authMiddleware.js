// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "Token bulunamadı" });
    }

    // Tokeni doğrula
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı DB’den al
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }

    // Token version kontrolü (token hırsızlığına karşı)
    if (
      typeof payload.tokenVersion !== "undefined" &&
      payload.tokenVersion !== user.tokenVersion
    ) {
      return res
        .status(401)
        .json({ message: "Token artık geçerli değil, lütfen yeniden giriş yap" });
    }

    // Request’e kullanıcıyı ekle
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token" });
  }
}

module.exports = authMiddleware;
