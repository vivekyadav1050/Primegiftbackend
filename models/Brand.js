import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brandId: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    image: String,
    logo: String,

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      index: true
    },

    denominationType: {
      type: String,
      enum: ["FIXED", "FLEXIBLE"]
    },

    redemptionType: String,

    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number, default: 0 },

    denominations: {
      type: [Number],
      default: []
    },

    tncUrl: String,

    // ✅ UI data
    termsAndConditions: {
      type: [String],
      default: []
    },

    usageInstructions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    howToUse: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },

    voucherExpiryInMonths: Number,

    category: {
      type: [String],
      default: [],
      index: true
    },

    tags: { type: [String], default: [] },

    // 🔥 DISCOUNT
    discountPercent: {
      type: Number,
      default: 0
    },

    // 🔥 PROFIT CONTROL
    costPricePercent: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);


// INDEXES (VERY IMPORTANT)

// 🔥 Hybrid search support (text ranking)
brandSchema.index({
  name: "text",
  description: "text",
  tags: "text"
});

// 🔥 Fast regex search
brandSchema.index({ name: 1 });

// 🔥 Query optimization (filtering)
brandSchema.index({ status: 1, category: 1 });

// 🔥 Optional: sort optimization
brandSchema.index({ name: 1, status: 1 });


export default mongoose.model("Brand", brandSchema);