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

    termsAndConditions: {
      type: [String],
      default: []
    },

    // ✅ structured instructions
    usageInstructions: {
      ONLINE: { type: [String], default: [] },
      OFFLINE: { type: [String], default: [] }
    },

    // ✅ API structured format
    howToUseInstructions: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    voucherExpiryInMonths: Number,

    category: {
      type: [String],
      default: [],
      index: true
    },

    tags: { type: [String], default: [] },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    costPricePercent: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

// INDEXES
brandSchema.index({
  name: "text",
  description: "text",
  tags: "text"
});

brandSchema.index({ status: 1, category: 1 });
brandSchema.index({ brandId: 1, status: 1 });

export default mongoose.model("Brand", brandSchema);