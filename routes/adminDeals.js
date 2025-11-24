// routes/adminDeals.js
import express from "express";
import Deal from "../models/Deal.js";
import upload from "../middleware/uploadImage.js";
import authPkg from "../middleware/authMiddleware.js";

const { authMiddleware, requireAdmin } = authPkg;

const router = express.Router();

/**
 * GET /api/admin/deals
 * Tüm kampanyaları listele (sadece admin)
 */
router.get("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const items = await Deal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error("Admin list deals error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/deals/:id
 * Tek kampanya detayı
 */
router.get("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    }
    res.json({ success: true, data: deal });
  } catch (err) {
    console.error("Get deal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/admin/deals
 * Yeni kampanya oluştur
 */
router.post("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const deal = await Deal.create(req.body);
    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    console.error("Create deal error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/deals/:id
 * Kampanya güncelle
 */
router.put("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    }
    res.json({ success: true, data: deal });
  } catch (err) {
    console.error("Update deal error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/admin/deals/:id/image
 * Resim yükleme/güncelleme (form-data: image)
 */
router.post(
  "/:id/image",
  authMiddleware,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Image required (field: image)" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const updated = await Deal.findByIdAndUpdate(
        req.params.id,
        { imageUrl },
        { new: true }
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Deal not found" });
      }

      res.json({
        success: true,
        message: "Image uploaded",
        data: updated,
      });
    } catch (err) {
      console.error("Upload image error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/**
 * DELETE /api/admin/deals/:id
 * Kampanya sil
 */
router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete deal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
