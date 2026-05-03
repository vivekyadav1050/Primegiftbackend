import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  brandId: { type: String, required: true },
  brandName: String,

  amount: { type: Number, required: true }, // 🔥 voucher value
  quantity: { type: Number, default: 1 }

}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [orderItemSchema],

  // 🔥 what user pays
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["CREATED", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED"],
    default: "CREATED"
  },

  payment: {
    method: { type: String, default: "UPI" },
    
    transactionId: String,
    razorpayOrderId: String,

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING"
    },

    // 🔥 ADD THESE (IMPORTANT)
    originalAmount: Number,     // ₹1000 (voucher value)
    discountPercent: Number,    // 5
    discountAmount: Number,     // ₹50
    finalAmount: Number         // ₹950 (same as totalAmount)
  },

  provider: {
    name: { type: String, default: "HUBBLE" },
    referenceId: String,
    response: mongoose.Schema.Types.Mixed
  },

  deliveryStatus: {
    type: String,
    enum: ["PENDING", "DELIVERED"],
    default: "PENDING"
  },

  failureReason: String

}, {
  timestamps: true
});

export default mongoose.model("Order", orderSchema);