import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },

  otpHash: {
    type: String,
    required: true
  },

  expiresAt: {
    type: Date,
    required: true
  }

}, { timestamps: true });

// ✅ ONLY this for TTL
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);