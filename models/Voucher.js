import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  brandId: String,

  code: { type: String, required: true },
  
  pinEncrypted: { type: String, required: true }, // 🔐 encrypted
  
  amount: Number,

  status: {
    type: String,
    enum: ["ACTIVE", "USED", "EXPIRED"],
    default: "ACTIVE"
  }

}, { timestamps: true });

export default mongoose.model("Voucher", voucherSchema);