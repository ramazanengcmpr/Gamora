// models/Deal.js
import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,     // örn: "food", "beauty", "travel"
  city: String,         // örn: "dubai"
  tags: [String],       // ["pizza", "italian", "family"]
  price: Number,
  oldPrice: Number,
  isActive: { type: Boolean, default: true },
   imageUrl: { type: String },   
  createdAt: { type: Date, default: Date.now },
},
 { timestamps: true }
);
const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
