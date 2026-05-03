import express from "express";
import { getAllProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

router.get("/allproduct", getAllProducts);
router.get("/product/:brandId", getProductById);

export default router;