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
  "abraham & thakore luxe gift card": 12,
  "absolute barbecues": 7,
  "adani meet and greet": 2.5,
  "adidas kids luxe gift card": 12,
  "aeropostale": 7,
  "air india": 3,
  "ajio": 6,
  "ajio luxe": 6,
  "ak ok luxe gift card": 12,
  "aldo": 8,
  "aliste": 18,
  "allen solly": 3,
  "amazon shopping": 2.45,
  "amazon fresh": 1,
  "amazon pay": 2.25,
  "amazon prime": 16,
  "amazon prime 12 months": 16,
  "american eagle": 1,
  "apollo": 10,
  "apollo diagnostics": 8,
  "apple premium reseller": 1,
  "archies": 10,
  "armani exchange-luxe gift card": 12,
  "asia seven express": 7,
  "assembly": 13,
  "@home": 7,
  "aurelia": 6,
  "auric": 23,
  "bagline": 13,
  "bakingo": 10,
  "bally-luxe gift card": 12,
  "barbeque nation": 5.25,
  "baskin robbins": 10,
  "bata": 8,
  "bath & body works": 8,
  "bb now": 2.5,
  "bear house": 7,
  "beer cafe": 6,
  "behrouz biryani": 10,
  "beverly hills polo club": 8,
  "beyoung": 13,
  "bgmi unipin": 6,
  "bhima jewellers": 2,
  "biba": 6,
  "bigbasket": 2.5,
  "bikanervala": 12,
  "birkenstock": 9,
  "black plus decker": 3.5,
  "blaupunkt": 8,
  "blinkit": 1.25,
  "blissclub": 11,
  "blue tokai": 12,
  "boat": 6,
  "boditive": 9,
  "bodycraft": 11,
  "bookmyshow": 2,
  "bottega veneta-luxe gift card": 12,
  "bpcl": 0,
  "brooks brothers-luxe gift card": 12,
  "buywithemi": 1,
  "cafe coffee day": 11,
  "cafe delhi heights": 8,
  "call it spring": 8,
  "campus": 6,
  "campus sutra": 10,
  "canali-luxe gift card": 12,
  "candere diamond jewellery": 0.5,
  "candere gold coin": 0,
  "candere gold jewellery": 0,
  "cello": 10,
  "cgh earth": 10,
  "charles & keith": 8,
  "charles tyrwhitt luxe gift card": 12,
  "chicago pizza": 14,
  "chicco": 11,
  "chumbak": 11,
  "chunmun": 2.5,
  "cinepolis": 18,
  "citizen watches": 11,
  "cleartrip": 6.5,
  "cleartrip hotel": 18,
  "cloud tailor": 7,
  "coach-luxe gift card": 12,
  "color plus": 8,
  "corseca": 18,
  "cosmus": 11,
  "costa coffee": 7,
  "croma": 2,
  "croma fixed": 2,
  "crossword": 6.5,
  "cultfit": 7,
  "dabba & co": 10,
  "daily objects": 13,
  "danube buildmart": 5.5,
  "decathlon": 3.5,
  "devagabond": 12,
  "diesel-luxe gift card": 12,
  "discovery+": 13,
  "district": 3,
  "district fixed": 4,
  "dominos": 11,
  "dominos fixed": 16.5,
  "donatekart": 2.5,
  "doodhvale": 13,
  "dpauls": 6.5,
  "dune london-luxe gift card": 12,
  "duroflex": 9,
  "ea7": 12
};

Object.assign(discountMap, {
  "easemytrip": 5.5,
  "easemytrip holiday": 10,
  "easemytrip hotel": 8.5,
  "easybuy": 9,
  "eatsure": 10,
  "wendy's": 10,
  "sweet truth": 10,
  "lunch box": 10,
  "the good bowl": 10,
  "emporio armani-luxe gift card": 12,
  "epic on": 5.5,
  "esbeda": 34,
  "estele": 10,
  "et prime subscription": 28,
  "euphoria gold coin": 1,
  "euphoria silver coin": 2,
  "faasos": 10,
  "fabindia": 8,
  "fashion factory": 0.5,
  "fastrack": 7,
  "fastrack bags": 6,
  "femmella": 9,
  "ferragamo": 12,
  "finusmart": 14,
  "firangi bake": 10,
  "firstcry": 5.5,
  "fitpass": 18,
  "flipkart": 2.25,
  "flixbus": 7,
  "flower aura": 13,
  "ferns n petals": 10,
  "forever 21": 1,
  "forever new": 7,
  "foxtale": 15,
  "freecultr": 18,
  "french accent": 7,
  "freshmenu": 3,
  "fricken": 10,
  "frido": 8,
  "funblock": 7,
  "funcity": 7,
  "gaana": 15,
  "gas-luxe gift card": 12,
  "genshin impact": 12,
  "giorgio armani-luxe gift card": 12,
  "girias": 1.5,
  "giva": 13,
  "giva gold voucher": 3.5,
  "giva silver coin": 4.75,
  "glam studios": 8,
  "goibibo hotel": 13,
  "goibibo": 5,
  "google play": 2,
  "grt jewellers": 1.4,
  "g-star raw": 12,
  "guhantara": 10,
  "gupta distributors": 3,
  "hamleys-luxe gift card": 12,
  "hammer": 18,
  "haute sauce": 7,
  "health & glow": 9,
  "healthians": 8,
  "healthkart": 11,
  "helios": 7,
  "hidesign": 11,
  "himalaya": 6,
  "hoichoi": 17,
  "home center (offline)": 4,
  "home center (online)": 6,
  "honest bowl": 10,
  "honkai: star rail 60 oneiric shard": 9,
  "hopintown plus": 7,
  "jiohotstar": 5,
  "hp pay": 0,
  "hugo boss-luxe gift card": 12,
  "hunkemoller": 12,
  "hush puppies": 8,
  "igp": 13,
  "ikea": 5,
  "imagine apple premium": 1,
  "indian terrain": 12,
  "inglot": 8,
  "instafab plus": 7,
  "iocl": 0,
  "irctc": 6,
  "itc hotels fabelle chocolates": 7.25,
  "itc hotels": 7.25,
  "itc hotels spa": 7.25,
  "ixigo": 5,
  "ixigo hotels": 11,
  "sri jagdamba pearls": 16,
  "jhari eco stay": 10,
  "jimmy choo-luxe gift card": 12,
  "jio mart": 3.1,
  "jockey": 12,
  "jos alukkas coin": 0.25,
  "jos alukkas jewellery": 2,
  "joyalukkas": 2.5,
  "joyalukkas diamond": 4.5,
  "joyalukkas pure gold": 1.25,
  "just lil things": 22,
  "kalyan diamond": 6.5,
  "kalyan gold coin": 1.5,
  "kalyan jewellers": 2.5,
  "kama ayurveda": 8,
  "kate spade-luxe gift card": 12,
  "ketan diamonds diamond only": 4,
  "ketan diamonds gold coin": 0,
  "ketan diamonds gold jewellery": 1,
  "kfc": 4.25,
  "kiehl’s": 6,
  "kimirica": 15,
  "klook": 5,
  "lakmé": 3.5,
  "lawrence & mayo": 7,
  "leaf studios": 7,
  "le creuset": 7,
  "lee": 6.5,
  "lenskart": 9,
  "levi's": 9,
  "liberty online": 6,
  "liberty shoes": 6,
  "lifestyle (offline)": 7,
  "lifestyle (online)": 8,
  "linen club": 9,
  "lionsgate play": 16,
  "lite bite food": 7,
  "live mint": 64,
  "louis philippe": 1,
  "love beauty and planet": 10,
  "lulu daily": 1,
  "lulu fashion store": 1,
  "lulu hypermarket": 1
});


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

      // const formatted = activeProducts.map((p) => {
      //   const discountPercent = discountMap[normalize(p.title)] || 0;

      //   return {
      //     brandId: p.id,
      //     name: p.title.trim(),
      //     image: p.thumbnailUrl,
      //     logo: p.logoUrl,
      //     status: p.status,
      //     denominationType: p.denominationType,
      //     redemptionType: p.redemptionType,
      //     minAmount: p.amountRestrictions?.minAmount || 0,
      //     maxAmount: p.amountRestrictions?.maxAmount || 0,
      //     denominations: p.amountRestrictions?.denominations || [],
      //     category: p.category || [],
      //     tags: p.tags || [],
      //     discountPercent
      //   };
      // });

        const formatted = activeProducts.map((p) => {
        const discountPercent = discountMap[normalize(p.title)] || 0;

        return {
          brandId: p.id,
          name: p.title.trim(),
          description: p.brandDescription || "",

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
          discountPercent,

          // 🔥 CRITICAL FIELDS
          usageInstructions: p.usageInstructions || {},
          howToUseInstructions: p.howToUseInstructions || [],
          termsAndConditions: p.termsAndConditions || [],
          tncUrl: p.tncUrl || "",
          voucherExpiryInMonths: p.voucherExpiryInMonths || null
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