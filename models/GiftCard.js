import mongoose from "mongoose";

// const giftCardSchema = new mongoose.Schema({
//   brand: String,
//   value: Number,
//   code: String,
//   costPrice: Number,
//   sellingPrice: Number,
//   status: {
//     type: String,
//     enum: ["available", "sold", "expired"],
//     default: "available"
//   },
//   expiryDate: Date,
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("GiftCard", giftCardSchema);import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema({
  brand: { type: String, required: true },

  value: { type: Number, required: true },

  code: { type: String, unique: true, required: true },

  pin: String,

  costPrice: { type: Number, required: true },

  sellingPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ["available", "sold", "expired"],
    default: "available"
  },

  expiryDate: { type: Date, required: true },

  createdAt: { type: Date, default: Date.now }

});

export default mongoose.model("GiftCard", giftCardSchema);