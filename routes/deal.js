// routes/deal.js
import express from "express";
import Deal from "../models/Deal.js";

const router = express.Router();

// GET /api/deals/search
router.get("/search", async (req, res) => {
  try {
    const {
      q,
      category,
      city,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isActive: true, // sadece aktif kampanyalar
    };

    // 1) Kelime araması (title, description, tags)
    if (q && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i"); // büyük/küçük harfe duyarsız
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    // 2) Kategori filtresi
    if (category && category !== "all") {
      filter.category = category;
    }

    // 3) Şehir filtresi
    if (city && city !== "all") {
      filter.city = city;
    }

    // 4) Fiyat filtresi
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Deal.find(filter)
        .sort({ createdAt: -1 }) // yeni kampanyalar önce
        .skip(skip)
        .limit(limitNum),
      Deal.countDocuments(filter),
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
    console.error("Search error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error (search)" });
  }
});

// ---------------------------------------------------------
// 🔥 YENİ EKLENDİ: Deal'ın imageUrl bilgisini dönen endpoint
// GET /api/deals/:id/image
// ---------------------------------------------------------
router.get("/:id/image", async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || !deal.imageUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Resim bulunamadı" });
    }

    res.json({
      success: true,
      imageUrl: deal.imageUrl,
    });
  } catch (err) {
    console.error("Get deal image error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error (get image)" });
  }
});

export default router;
