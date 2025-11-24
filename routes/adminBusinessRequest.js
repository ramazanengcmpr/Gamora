// routes/adminBusinessRequests.js
import express from "express";
import BusinessRequest from "../models/BusinessRequest.js";
import authPkg from "../middleware/authMiddleware.js";

const { authMiddleware, requireAdmin } = authPkg;

const router = express.Router();

/**
 * GET /api/admin/business-requests
 * Tüm başvuruları listele (filtreli)
 */
router.get("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (q && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { fullName: regex },
        { businessName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      BusinessRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      BusinessRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("List business requests error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/business-requests/:id
 * Tek başvuru detayı
 */
router.get("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const doc = await BusinessRequest.findById(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("Get business request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PATCH /api/admin/business-requests/:id/status
 * Başvuru durumunu değiştir (pending/reviewed/approved/rejected)
 */
router.patch("/:id/status", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "reviewed", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz status değeri",
      });
    }

    const doc = await BusinessRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("Update business request status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * DELETE /api/admin/business-requests/:id
 * Başvuruyu sil
 */
router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const doc = await BusinessRequest.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete business request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
