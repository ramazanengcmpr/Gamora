// routes/businessRequest.js
import express from "express";
import BusinessRequest from "../models/BusinessRequest.js";

const router = express.Router();

/**
 * POST /api/business-requests
 * İşletme sahibiyim formu (mobil uygulamadaki bej buton)
 */
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      city,
      message,
    } = req.body;

    if (!fullName || !phone || !businessName) {
      return res.status(400).json({
        success: false,
        message: "fullName, phone ve businessName zorunludur.",
      });
    }

    const requestDoc = await BusinessRequest.create({
      fullName,
      email,
      phone,
      businessName,
      city,
      message,
      source: "mobile_app",
    });

    res.status(201).json({
      success: true,
      data: requestDoc,
      message: "Başvurunuz alındı. En kısa sürede sizinle iletişime geçeceğiz.",
    });
  } catch (err) {
    console.error("Create business request error:", err);
    res.status(500).json({
      success: false,
      message: "Server error (business request)",
    });
  }
});

export default router;
