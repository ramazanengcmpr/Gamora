// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ESM dosyalar
import dealRoutes from "./routes/deal.js";
import businessRequestRoutes from "./routes/businessRequest.js";
import adminBusinessRequestsRoutes from "./routes/adminBusinessRequest.js";
import adminDealsRoutes from "./routes/adminDeals.js";

// CommonJS dosyalar (auth route + middleware)
import authRoutesCjs from "./routes/auth.js";
import authMiddlewarePkg from "./middleware/authMiddleware.js";

// .env
dotenv.config();

// __dirname (ESM için)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CJS export'larını ayır
const authRoutes = authRoutesCjs;              // routes/auth.js -> module.exports = router
const { authMiddleware } = authMiddlewarePkg;  // { authMiddleware, requireAdmin }

// Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Statik uploads klasörü
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public routes
app.use("/api/deals", dealRoutes);
app.use("/api/business-requests", businessRequestRoutes);

// Admin routes
app.use("/api/admin/business-requests", adminBusinessRequestsRoutes);
app.use("/api/admin/deals", adminDealsRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

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
