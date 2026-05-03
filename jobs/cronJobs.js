import cron from "node-cron";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Brand from "../models/Brand.js";
import User from "../models/User.js";
import { getValidToken } from "../services/hubbleService.js";


const BASE_URL = process.env.HUBBLE_BASE_URL;

function normalize(name) {
  return name?.toLowerCase().trim();
}

// 🔥 FULL DISCOUNT MAP (same as yours)
const discountMap = {
  "amazon shopping": 2,
  "flipkart": 2,
  "myntra": 2,
  "zomato": 12,
  "dominos": 12,
  "pvr": 20,
  "uber": 4,
  "starbucks": 14,
  "ajio": 7,
  "nykaa": 6.25
};

export const initCronJobs = () => {

  // 🧹 cleanup users
cron.schedule("*/15 * * * *", async () => {
    const expiryTime = new Date(Date.now() - 15 * 60 * 1000);
    console.log("clening");

    await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: expiryTime }
    });
  });

  // 🔄 HUBBLE SYNC
cron.schedule("0 */12 * * *", async () => {
    try {
      const token = await getValidToken();
      console.log("sync");

        const res = await axios.get(
        `${BASE_URL}/v1/partners/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-request-id": uuidv4(),
          },
        }
      );

      const products = res.data.data || [];

      const activeProducts = products.filter(p => p.status === "ACTIVE");

      const formatted = activeProducts.map((p) => {
        const discountPercent = discountMap[normalize(p.title)] || 0;

        return {
          brandId: p.id,
          name: p.title.trim(),
          image: p.thumbnailUrl,
          logo: p.logoUrl,
          status: p.status,
          denominationType: p.denominationType,
          redemptionType: p.redemptionType,
          minAmount: p.amountRestrictions?.minAmount || 0,
          maxAmount: p.amountRestrictions?.maxAmount || 0,
          denominations: p.amountRestrictions?.denominations || [],
          category: p.category || [],
          tags: p.tags || [],
          discountPercent
        };
      });

      const apiBrandIds = formatted.map(p => p.brandId);

      await Brand.bulkWrite(
        formatted.map((item) => ({
          updateOne: {
            filter: { brandId: item.brandId },
            update: { $set: item },
            upsert: true,
          },
        }))
      );

      await Brand.deleteMany({
        brandId: { $nin: apiBrandIds }
      });

    } catch (error) {
console.error("❌ Cron Error:",
    error.response?.data || error.message
  );
    }
});


};