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
      return res.status(401).json({ message: "a user cannot found" });
    }

    // Token version kontrolü (token çalınmasına karşı)
    if (
      typeof payload.tokenVersion !== "undefined" &&
      payload.tokenVersion !== user.tokenVersion
    ) {
      return res
        .status(401)
        .json({ message: "this Token not avaliable , please login again" });
    }

    // Kullanıcı objesini request’e ekle
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "unavaliable token" });
  }
}

/**
 * 🔥 ADMIN CHECK MIDDLEWARE
 * Bu middleware sadece admin role sahip kullanıcıları içeri alır.
 * User modelinde role alanı yoksa:
 *  -> User schema’ya { role: { type: String, default: "user" } } eklemen yeterli.
 */
function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Yetkisiz erişim" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bu işlem için admin olmalısın" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(500).json({ message: "Admin doğrulama hatası" });
  }
}

module.exports = {
  authMiddleware,
  requireAdmin,
};
