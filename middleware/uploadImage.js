// middleware/uploadImage.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// __dirname oluştur (ESM için)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads klasörüne kaydet
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // GAMORA/uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
