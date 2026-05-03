// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,

//   isVerified: {
//     type: Boolean,
//     default: false
//   },

//   role: { type: String, default: "user" }
// }, { timestamps: true });

// export default mongoose.model("User", userSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  
  name: { type: String, required: true },

  email: { 
    type: String, 
    unique: true, 
    required: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  phone: {
    type: String
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },

  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE"
  },

  walletBalance: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);