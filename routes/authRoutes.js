import express from "express";
import { register, verifyOtp, resendOtp, login } from "../controllers/authController.js";
import { otpLimiter, loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/register", registerLimiter, register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", loginLimiter, login);


router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});


export default router;