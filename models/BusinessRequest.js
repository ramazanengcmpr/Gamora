// models/BusinessRequest.js
import mongoose from "mongoose";

const businessRequestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },       // işletme sahibinin adı
    email: { type: String },                          // opsiyonel
    phone: { type: String, required: true },          // iletişim telefonu
    businessName: { type: String, required: true },   // işletme adı
    city: { type: String },                           // şehir
    message: { type: String },                        // ekstra not / talep
    source: { type: String, default: "mobile_app" },  // nereden geldi
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const BusinessRequest = mongoose.model("BusinessRequest", businessRequestSchema);

export default BusinessRequest;
