import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import resend from "../services/emailService.js";

const SECRETKEY=process.env.APP_SECRET_KEY;


// ================= REGISTER =================
export const register = async (req, res) => {
  console.log("API HIT");

  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    // check user
    let existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // delete old OTP
    await Otp.deleteMany({ email });

    // save OTP
    await Otp.create({
      email,
      otpHash,
      expiresAt
    });

    // create/update user
    if (!existingUser) {
      existingUser = new User({
        name,
        email,
        password: hashedPassword,
        isVerified: false
      });
    } else {
      existingUser.password = hashedPassword;
    }

    await existingUser.save();

    // send email
    await resend.emails.send({
      from: "PrimeGift <noreply@primegift.in>",
      to: email,
      subject: "Verify your email",
      html: `<h2>Your OTP is: ${otp}</h2>`
    });

    return res.status(200).json({
      message: "OTP sent to your email"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};


// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("verify api hit");

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required"
      });
    }

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({
        message: "OTP expired or not found"
      });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified"
      });
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteMany({ email });

    return res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};


// ================= RESEND OTP =================
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("resend api hit");

    if (!email) {
      return res.status(400).json({
        message: "Email required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otpHash,
      expiresAt
    });

    await resend.emails.send({
      from: "PrimeGift <noreply@primegift.in>",
      to: email,
      subject: "Resend OTP",
      html: `<h2>Your OTP is: ${otp}</h2>`
    });

    return res.status(200).json({
      message: "OTP resent successfully"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};


// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRETKEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      name: user.name
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};