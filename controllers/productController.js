import Brand from "../models/Brand.js";

const LIMIT = 20;

export const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, search = "" } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);

    let matchStage = { status: "ACTIVE" };

    // 🔥 CATEGORY
    if (category && category !== "All") {
      matchStage.category = { $in: [category] };
    }

    // 🔥 SAFE REGEX (IMPORTANT)
    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeSearch = escapeRegex(search);

    // 🔥 SEARCH CONDITION
    if (search) {
      matchStage.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { tags: { $regex: safeSearch, $options: "i" } }
      ];
    }

    // 🔥 TOTAL COUNT
    const total = await Brand.countDocuments(matchStage);

    // 🔥 AGGREGATION (for priority sorting)
    let pipeline = [
      { $match: matchStage }
    ];

    if (search) {
      pipeline.push({
        $addFields: {
          priority: {
            $cond: [
              { $regexMatch: { input: "$name", regex: `^${safeSearch}`, options: "i" } },
              1, // starts with
              2  // contains
            ]
          }
        }
      });

      pipeline.push({ $sort: { priority: 1, name: 1 } });
    } else {
      pipeline.push({ $sort: { name: 1 } });
    }

    // 🔥 PAGINATION
    pipeline.push(
      { $skip: (pageNum - 1) * LIMIT },
      { $limit: LIMIT }
    );

    // 🔥 SELECT FIELDS
    pipeline.push({
      $project: {
        _id: 0,
        id: "$brandId",
        name: 1,
        image: 1,
        logo: 1,
        category: 1,
        discount: { $ifNull: ["$discountPercent", 0] }
      }
    });

    const products = await Brand.aggregate(pipeline);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / LIMIT),
      products
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Brand.findOne({ brandId: req.params.brandId });

    if (!product) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: product });

  } catch {
    res.status(500).json({ success: false });
  }
};