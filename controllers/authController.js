import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import resend from "../services/emailService.js";
import axios from "axios";


const SECRETKEY=process.env.APP_SECRET_KEY;


// ================= REGISTER =================
// export const register = async (req, res) => {

//   try {
//     const { name, email, password } = req.body;

//     // validation
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password too short" });
//     }

//     // check user
//     let existingUser = await User.findOne({ email });

//     if (existingUser && existingUser.isVerified) {
//       return res.status(400).json({
//         message: "User already exists"
//       });
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpHash = await bcrypt.hash(otp, 10);

//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

//     // delete old OTP
//     await Otp.deleteMany({ email });

//     // save OTP
//     await Otp.create({
//       email,
//       otpHash,
//       expiresAt
//     });

//     // create/update user
//     if (!existingUser) {
//       existingUser = new User({
//         name,
//         email,
//         password: hashedPassword,
//         isVerified: false
//       });
//     } else {
//       existingUser.password = hashedPassword;
//     }

//     await existingUser.save();

// let emailResponse;

// try {
//   emailResponse = await resend.emails.send({
//     from: "PrimeGift <noreply@primegift.in>",
//     to: email,
//     subject: "Verify your email",
//     html: `<h2>Your OTP is: ${otp}</h2>`
//   });


// } catch (emailError) {

//   return res.status(500).json({
//     success: false,
//     message: "Failed to send OTP email"
//   });
// }

// // ✅ FIX: correct response check
// if (!emailResponse || !emailResponse.data || !emailResponse.data.id) {
//   return res.status(500).json({
//     success: false,
//     message: "Failed to send OTP. Please try again."
//   });
// }

// return res.status(200).json({
//   success: true,
//   message: "OTP sent to your email"
// });


//   } catch (err) {
//     return res.status(500).json({
//       error: err.message
//     });
//   }


// };


//register with phone and 2factor.in OTP

export const register = async (req, res) => {
  try {

    const { name, email, phone, password } = req.body;

    // validation
    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    // phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    // password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password too short"
      });
    }

    // existing user
    let existingUser = await User.findOne({ phone });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create/update user
    if (!existingUser) {

      existingUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        isVerified: false
      });

    } else {

      existingUser.name = name;
      existingUser.email = email;
      existingUser.password = hashedPassword;
    }

    await existingUser.save();

    // SEND OTP
    const response = await axios.get(
      `${process.env.TWO_FACTOR_BASE_URL}/${process.env.TWO_FACTOR_API_KEY}/SMS/+91${phone}/AUTOGEN/OTP1`
    );


    if (response.data.Status !== "Success") {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP"
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      sessionId: response.data.Details
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// ================= VERIFY OTP =================
// export const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;


//     if (!email || !otp) {
//       return res.status(400).json({
//         message: "Email and OTP required"
//       });
//     }

//     const record = await Otp.findOne({ email });

//     if (!record) {
//       return res.status(400).json({
//         message: "OTP expired or not found"
//       });
//     }

//     const isMatch = await bcrypt.compare(otp, record.otpHash);

//     if (!isMatch) {
//       return res.status(400).json({
//         message: "Invalid OTP"
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found"
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         message: "User already verified"
//       });
//     }

//     user.isVerified = true;
//     await user.save();

//     await Otp.deleteMany({ email });

//     return res.status(200).json({
//       message: "Email verified successfully"
//     });

//   } catch (err) {
//     return res.status(500).json({
//       error: err.message
//     });
//   }
// };

export const verifyOtp = async (req, res) => {
  try {

    const { phone, otp, sessionId } = req.body;

    if (!phone || !otp || !sessionId) {
      return res.status(400).json({
        message: "Phone, OTP and sessionId required"
      });
    }

    // VERIFY OTP WITH 2FACTOR
    const response = await axios.get(
      `${process.env.TWO_FACTOR_BASE_URL}/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    console.log(response.data);

    if (response.data.Status !== "Success") {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // FIND USER
    const user = await User.findOne({ phone });

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

    // VERIFY USER
    user.isVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Mobile verified successfully"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};





// ================= RESEND OTP =================
// export const resendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;


//     if (!email) {
//       return res.status(400).json({
//         message: "Email required"
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found"
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         message: "User already verified"
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpHash = await bcrypt.hash(otp, 10);

//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

//     await Otp.deleteMany({ email });

//     await Otp.create({
//       email,
//       otpHash,
//       expiresAt
//     });

// let emailResponse;

// try {
//   emailResponse = await resend.emails.send({
//     from: "PrimeGift <noreply@primegift.in>",
//     to: email,
//     subject: "Resend OTP",
//     html: `<h2>Your OTP is: ${otp}</h2>`
//   });

// } catch (error) {

//   return res.status(500).json({
//     success: false,
//     message: "Failed to resend OTP"
//   });
// }

// // ✅ check resend response properly
// if (!emailResponse || !emailResponse.data || !emailResponse.data.id) {
//   return res.status(500).json({
//     success: false,
//     message: "Failed to resend OTP. Try again."
//   });
// }

// return res.status(200).json({
//   success: true,
//   message: "OTP resent successfully"
// });

//   } catch (err) {
//     return res.status(500).json({
//       error: err.message
//     });
//   }
// };



//resend OTP for phone and 2factor.in
export const resendOtp = async (req, res) => {
  try {

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number required"
      });
    }

    const response = await axios.get(
      `${process.env.TWO_FACTOR_BASE_URL}/${process.env.TWO_FACTOR_API_KEY}/SMS/+91${phone}/AUTOGEN/OTP1`
    );

    console.log(response.data);

    if (response.data.Status !== "Success") {
      return res.status(400).json({
        message: "Failed to resend OTP"
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      sessionId: response.data.Details
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= LOGIN =================
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       SECRETKEY,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       message: "Login successful",
//       token,
//       name: user.name
//     });

//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };



//login with phone and 2factor.in OTP
export const login = async (req, res) => {

  try {
    console.log("Login attempt with data:", req.body);

    const { phone, password } = req.body;

    // validation
    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone and password required"
      });
    }

    // find user
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // check verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your mobile number"
      });
    }

    // check blocked
    if (user.status === "BLOCKED") {
      return res.status(403).json({
        message: "Your account is blocked"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // token
    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role
      },
      SECRETKEY,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      name: user.name
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//forget password and reset password can be implemented similarly by sending OTP to phone and verifying it with 2factor.in before allowing password reset.
export const forgotPasswordSendOtp = async (req, res) => {

  try {

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number required"
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const response = await axios.get(
      `${process.env.TWO_FACTOR_BASE_URL}/${process.env.TWO_FACTOR_API_KEY}/SMS/+91${phone}/AUTOGEN/OTP1`
    );

    if (response.data.Status !== "Success") {
      return res.status(400).json({
        message: "Failed to send OTP"
      });
    }

    return res.status(200).json({
      success: true,
      sessionId: response.data.Details,
      message: "OTP sent successfully"
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//verify OTP for forgot password and return reset token
export const forgotPasswordVerifyOtp = async (req, res) => {

  try {

    const { phone, otp, sessionId } = req.body;

    const response = await axios.get(
      `${process.env.TWO_FACTOR_BASE_URL}/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (response.data.Status !== "Success") {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // reset token
    const resetToken = jwt.sign(
      { phone },
      SECRETKEY,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      resetToken
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

//Finally reset password
export const resetPassword = async (req, res) => {

  try {

    const { newPassword, resetToken } = req.body;

    if (!newPassword || !resetToken) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    const decoded = jwt.verify(
      resetToken,
      SECRETKEY
    );

    const user = await User.findOne({
      phone: decoded.phone
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};