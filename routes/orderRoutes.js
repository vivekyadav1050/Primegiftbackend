import express from "express";
import {
  createOrder,
  verifyPayment,
  getOrderStatus,
  getMyOrders
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createorder", authMiddleware, createOrder);
router.post("/verifypayment", authMiddleware, verifyPayment);
// router.get("/order-status/:id", authMiddleware, getOrderStatus);
// router.get("/my-orders-full", authMiddleware, getMyOrders);


router.get("/order-status/:id", authMiddleware, getOrderStatus);
router.get("/my-orders-full", authMiddleware, getMyOrders);

export default router;